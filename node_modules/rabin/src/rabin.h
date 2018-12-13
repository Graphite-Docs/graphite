#ifndef _RABIN_H
#define _RABIN_H

#include <stdint.h>

#define WINSIZE 64

struct rabin_t {
  uint8_t window[WINSIZE];
  uint64_t wpos;
  uint64_t count;
  uint64_t pos;
  uint64_t start;
  uint64_t digest;
  uint64_t chunk_start;
  uint64_t chunk_length;
  uint64_t chunk_cut_fingerprint;
  uint64_t polynomial;
  uint64_t polynomial_degree;
  uint64_t polynomial_shift;
  uint64_t average_bits;
  uint64_t minsize;
  uint64_t maxsize;
  uint64_t mask;
};

struct rabin_t *rabin_init(struct rabin_t *h);
void rabin_reset(struct rabin_t *h);
void rabin_slide(struct rabin_t *h, uint8_t b);
void rabin_append(struct rabin_t *h, uint8_t b);
int rabin_next_chunk(struct rabin_t *h, uint8_t *buf, uint64_t len);

#endif
