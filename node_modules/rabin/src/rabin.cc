#include <err.h>
#include <stdlib.h>
#include <stdbool.h>
#include "rabin.h"

static bool tables_initialized = false;
static uint64_t mod_table[256];
static uint64_t out_table[256];

static int deg(uint64_t p) {
    uint64_t mask = 0x8000000000000000LL;

    for (int i = 0; i < 64; i++) {
        if ((mask & p) > 0) {
            return 63 - i;
        }

        mask >>= 1;
    }

    return -1;
}

// Mod calculates the remainder of x divided by p.
static uint64_t mod(uint64_t x, uint64_t p) {
    while (deg(x) >= deg(p)) {
        uint64_t shift = deg(x) - deg(p);

        x = x ^ (p << shift);
    }

    return x;
}

static uint64_t append_byte(uint64_t hash, uint8_t b, uint64_t pol) {
    hash <<= 8;
    hash |= (uint64_t)b;

    return mod(hash, pol);
}

static void calc_tables(struct rabin_t *h) {
    // calculate table for sliding out bytes. The byte to slide out is used as
    // the index for the table, the value contains the following:
    // out_table[b] = Hash(b || 0 ||        ...        || 0)
    //                          \ windowsize-1 zero bytes /
    // To slide out byte b_0 for window size w with known hash
    // H := H(b_0 || ... || b_w), it is sufficient to add out_table[b_0]:
    //    H(b_0 || ... || b_w) + H(b_0 || 0 || ... || 0)
    //  = H(b_0 + b_0 || b_1 + 0 || ... || b_w + 0)
    //  = H(    0     || b_1 || ...     || b_w)
    //
    // Afterwards a new byte can be shifted in.
    for (int b = 0; b < 256; b++) {
        uint64_t hash = 0;

        hash = append_byte(hash, (uint8_t)b, h->polynomial);
        for (int i = 0; i < WINSIZE-1; i++) {
            hash = append_byte(hash, 0, h->polynomial);
        }
        out_table[b] = hash;
    }

    // calculate table for reduction mod Polynomial
    int k = deg(h->polynomial);
    for (int b = 0; b < 256; b++) {
        // mod_table[b] = A | B, where A = (b(x) * x^k mod pol) and  B = b(x) * x^k
        //
        // The 8 bits above deg(Polynomial) determine what happens next and so
        // these bits are used as a lookup to this table. The value is split in
        // two parts: Part A contains the result of the modulus operation, part
        // B is used to cancel out the 8 top bits so that one XOR operation is
        // enough to reduce modulo Polynomial
        mod_table[b] = mod(((uint64_t)b) << k, h->polynomial) | ((uint64_t)b) << k;
    }
}

void rabin_append(struct rabin_t *h, uint8_t b) {
    uint8_t index = (uint8_t)(h->digest >> h->polynomial_shift);
    h->digest <<= 8;
    h->digest |= (uint64_t)b;
    h->digest ^= mod_table[index];
}

void rabin_slide(struct rabin_t *h, uint8_t b) {
    uint8_t out = h->window[h->wpos];
    h->window[h->wpos] = b;
    h->digest = (h->digest ^ out_table[out]);
    h->wpos = (h->wpos +1 ) % WINSIZE;
    rabin_append(h, b);
}

void rabin_reset(struct rabin_t *h) {
    for (int i = 0; i < WINSIZE; i++)
        h->window[i] = 0;
    h->digest = 0;
    h->wpos = 0;
    h->count = 0;
    h->digest = 0;

    rabin_slide(h, 1);
}

int rabin_next_chunk(struct rabin_t *h, uint8_t *buf, uint64_t len) {
    for (uint64_t i = 0; i < len; i++) {
        uint8_t b = *buf++;

        rabin_slide(h, b);

        h->count++;
        h->pos++;

        if ((h->count >= h->minsize && ((h->digest & h->mask) == 0)) || h->count >= h->maxsize) {
            h->chunk_start = h->start;
            h->chunk_length = h->count;
            h->chunk_cut_fingerprint = h->digest;

            rabin_reset(h);
            return i+1;
        }
    }

    return -1;
}

struct rabin_t *rabin_init(struct rabin_t *h) {
    if (!tables_initialized) {
        calc_tables(h);
        tables_initialized = true;
    }

    h->pos = 0;
    h->start = 0;
    rabin_reset(h);

    return h;
}
