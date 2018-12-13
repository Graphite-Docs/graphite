#pragma once

#include <array>
#include <cassert>
#include <iostream>
#include <openssl/sha.h>
#include <sstream>
#include <vector>

#include "../native/secp256k1/include/secp256k1.h"
#include "hexxer.hpp"
#include "json.hpp"

typedef std::array<uint8_t, 32> uint8_t_32;
typedef std::array<uint8_t, 33> uint8_t_33;
typedef std::array<uint8_t, 64> uint8_t_64;
typedef std::array<uint8_t, 65> uint8_t_65;
typedef std::vector<uint8_t> uint8_t_vec;

template <typename A>
auto vectorify (const A a) {
	return uint8_t_vec(a.begin(), a.end());
}

namespace {
	uint32_t s = 0xdeadbeef;
	uint32_t xorshift32() {
		s ^= s << 13;
		s ^= s >> 17;
		s ^= s << 5;
		return s;
	}
}

auto randomUInt8 () {
	return xorshift32() % 255;
}

template <typename A>
auto random () {
	A a;
	for (auto& x : a) x = randomUInt8();
	return a;
}

template <typename A>
auto randomHigh () {
	auto x = random<A>();
	for (auto i = x.size() / 2; i < x.size(); ++i) {
		x.at(i) = 0xff;
	}
	return x;
}

template <typename A>
auto randomLow () {
	auto x = random<A>();
	for (auto i = 0ul; i < x.size() / 2; ++i) {
		x.at(i) = 0;
	}
	return x;
}

template <typename A>
auto fromUInt32 (const uint32_t i) {
	A x;
	x.fill(0);
	const auto s = x.size();
	x.at(s - 4) = i >> 24;
	x.at(s - 3) = i >> 16;
	x.at(s - 2) = i >> 8;
	x.at(s - 1) = i & 0xff;
	return x;
}

auto randomScalar () { return random<uint8_t_32>(); }
auto randomScalarHigh () { return randomHigh<uint8_t_32>(); }
auto randomScalarLow () { return randomLow<uint8_t_32>(); }
auto scalarFromUInt32 (const uint32_t i) { return fromUInt32<uint8_t_32>(i); }

template <typename A>
auto fromHex (const std::string& s) {
	assert(s.size() == sizeof(A) * 2);
	A x;
	auto i = 0;
	for (auto& y : x) {
		const auto a = s.at(i++);
		const auto b = s.at(i++);
		y = hexxer::decode(a, b);
	}
	return x;
}

auto pointFromHex (const std::string& s) {
	if (s.size() == 66) return vectorify(fromHex<uint8_t_33>(s));
	if (s.size() == 130) return vectorify(fromHex<uint8_t_65>(s));
	assert(false);
}
auto scalarFromHex (const std::string& s) { return fromHex<uint8_t_32>(s); }
auto signatureFromHex (const std::string& s) { return fromHex<uint8_t_64>(s); }

secp256k1_context* ctx = nullptr;

auto randomPrivate () {
	while (true) {
		const auto key = randomScalar();
		if (secp256k1_ec_seckey_verify(ctx, key.data())) return key;
	}
}

auto randomPrivateHigh () {
	while (true) {
		const auto key = randomScalarHigh();
		if (secp256k1_ec_seckey_verify(ctx, key.data())) return key;
	}
}

auto randomPrivateLow () {
	while (true) {
		const auto key = randomScalarLow();
		if (secp256k1_ec_seckey_verify(ctx, key.data())) return key;
	}
}

// utility functions
void _ec_init () {
	ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN | SECP256K1_CONTEXT_VERIFY);
}

auto _privAdd (uint8_t_32 key, const uint8_t_32 tweak, bool& ok) {
	ok &= secp256k1_ec_privkey_tweak_add(ctx, key.data(), tweak.data());
	return key;
}

auto _privSub (uint8_t_32 key, uint8_t_32 tweak, bool& ok) {
	ok &= secp256k1_ec_privkey_negate(ctx, tweak.data());
	ok &= secp256k1_ec_privkey_tweak_add(ctx, key.data(), tweak.data());
	return key;
}

template <typename A>
uint8_t_vec _ec_pubkey_to_vec (const secp256k1_pubkey& public_key, bool& ok) {
	static_assert(sizeof(A) == 33 || sizeof(A) == 65);
	if (!ok) return {};
	A out;
	size_t outlen = out.size();
	ok &= secp256k1_ec_pubkey_serialize(ctx, out.data(), &outlen, &public_key,
		sizeof(A) == 33 ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED);
	return vectorify<A>(out);
}

template <typename A, typename V>
auto _pointAdd (const V p, const V q, bool& ok) {
	secp256k1_pubkey a, b;
	ok &= secp256k1_ec_pubkey_parse(ctx, &a, p.data(), p.size());
	ok &= secp256k1_ec_pubkey_parse(ctx, &b, q.data(), q.size());

	const secp256k1_pubkey* points[] = { &a, &b };
	secp256k1_pubkey public_key;
	ok &= secp256k1_ec_pubkey_combine(ctx, &public_key, points, 2);

	return _ec_pubkey_to_vec<A>(public_key, ok);
}

template <typename A, typename V>
auto _pointMul (const V p, const uint8_t_32 d, bool& ok) {
	secp256k1_pubkey public_key;
	ok &= secp256k1_ec_pubkey_parse(ctx, &public_key, p.data(), p.size());
	ok &= secp256k1_ec_pubkey_tweak_mul(ctx, &public_key, d.data());
	return _ec_pubkey_to_vec<A>(public_key, ok);
}

template <typename A, typename V>
auto _pointAddScalar (const V p, const uint8_t_32 d, bool& ok) {
	secp256k1_pubkey public_key;
	ok &= secp256k1_ec_pubkey_parse(ctx, &public_key, p.data(), p.size());
	ok &= secp256k1_ec_pubkey_tweak_add(ctx, &public_key, d.data());
	return _ec_pubkey_to_vec<A>(public_key, ok);
}

uint8_t_vec _pointFlip (const uint8_t_vec& p) {
	assert(!p.empty());

	secp256k1_pubkey public_key;
	bool ok = secp256k1_ec_pubkey_parse(ctx, &public_key, p.data(), p.size());
	assert(ok);

	uint8_t_vec r;
	if (p.size() == 33) r = _ec_pubkey_to_vec<uint8_t_65>(public_key, ok);
	else r = _ec_pubkey_to_vec<uint8_t_33>(public_key, ok);
	assert(ok);

	return std::move(r);
}

template <typename A>
auto _pointFromScalar (const uint8_t_32 s, bool& ok) {
	secp256k1_pubkey public_key;
	ok &= secp256k1_ec_pubkey_create(ctx, &public_key, s.data());
	return _ec_pubkey_to_vec<A>(public_key, ok);
}

template <typename A>
auto _pointFromUInt32 (const uint32_t i, bool& ok) {
	return _pointFromScalar<A>(scalarFromUInt32(i), ok);
}

auto _pointFromX (const uint8_t_32 x, uint8_t prefix) {
	uint8_t_vec p = { prefix };
	p.reserve(33);
	for (auto i : x) p.emplace_back(i);
	return p;
}

auto _pointFromXY (const uint8_t_32 x, const uint8_t_32 y, const uint8_t prefix = 0x04) {
	uint8_t_vec p = { prefix };
	p.reserve(65);
	for (auto i : x) p.emplace_back(i);
	for (auto i : y) p.emplace_back(i);
	return p;
}

auto _signatureFromRS (const uint8_t_32 r, const uint8_t_32 s) {
	uint8_t_64 sig;
	std::copy(r.begin(), r.end(), sig.begin());
	std::copy(s.begin(), s.end(), sig.begin() + 32);
	return sig;
}

auto _eccSign (const uint8_t_32 d, const uint8_t_32 message, bool& ok) {
	uint8_t_64 output;
	secp256k1_ecdsa_signature signature;
	ok &= secp256k1_ecdsa_sign(ctx, &signature, message.data(), d.data(), nullptr, nullptr);
	ok &= secp256k1_ecdsa_signature_serialize_compact(ctx, output.data(), &signature);
	return output;
}

template <typename A>
auto _eccVerify (const A& p, const uint8_t_32 message, const uint8_t_64 signature) {
	secp256k1_pubkey public_key;
	bool ok = true;
	ok &= secp256k1_ec_pubkey_parse(ctx, &public_key, p.data(), p.size());
	if (!ok) return false;

	secp256k1_ecdsa_signature _signature;
	ok &= secp256k1_ecdsa_signature_parse_compact(ctx, &_signature, signature.data());
	if (!ok) return false;

	ok &= secp256k1_ecdsa_verify(ctx, &_signature, message.data(), &public_key);
	return ok;
}

template <typename A>
auto sha256 (const A& m) {
	uint8_t_32 h;
	SHA256_CTX hctx;
	SHA256_Init(&hctx);
	SHA256_Update(&hctx, m.data(), m.size());
	SHA256_Final(h.data(), &hctx);
	return h;
}

// we use 0xfefefefefefefe.... as a null placeholder
template <typename A>
auto Null () {
	A a;
	a.fill(0xfe);
	return a;
}
template <typename A>
auto isNull (const A& a) {
	for (auto x : a) if (x != 0xfe) return false;
	return true;
}

const auto ZERO = scalarFromHex("0000000000000000000000000000000000000000000000000000000000000000");
const auto ONE = scalarFromHex("0000000000000000000000000000000000000000000000000000000000000001");
const auto TWO = scalarFromHex("0000000000000000000000000000000000000000000000000000000000000002");
const auto THREE = scalarFromHex("0000000000000000000000000000000000000000000000000000000000000003");
const auto FOUR = scalarFromHex("0000000000000000000000000000000000000000000000000000000000000004");
const auto GROUP_ORDER = scalarFromHex("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
const auto GROUP_ORDER_LESS_3 = scalarFromHex("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036413e");
const auto GROUP_ORDER_LESS_2 = scalarFromHex("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036413f");
const auto GROUP_ORDER_LESS_1 = scalarFromHex("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140");
const auto GROUP_ORDER_OVER_1 = scalarFromHex("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364142");
const auto UINT256_MAX = scalarFromHex("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
const auto G = pointFromHex("0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798");
const auto GU = pointFromHex("0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8");
const auto P_LESS_1 = scalarFromHex("fffffffffffffffffffffffffffffffffffffffffffffffffffffffeeffffc2e");
const auto P = scalarFromHex("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
const auto P_OVER_1 = scalarFromHex("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc30");

template <typename A> struct B { A a; std::string desc = ""; };

const std::vector<B<uint8_t_32>> BAD_PRIVATES = {
	{ ZERO, "Private key == 0" },               // #L3145, #L3684, fail, == 0
	{ GROUP_ORDER, "Private key >= G" },        // #L3115, #L3670, fail, == G
	{ GROUP_ORDER_OVER_1, "Private key >= G" }, // #L3162, #L3701, fail, >= G
	{ UINT256_MAX, "Private key >= G" }         // #L3131, #L3676, fail, > G
};

// excludes exact complement of a key, assumed to be tested elsewhere
const std::vector<B<uint8_t_32>> BAD_TWEAKS = {
	{ GROUP_ORDER, "Tweak >= G" },
	{ GROUP_ORDER_OVER_1, "Tweak >= G" },
	{ UINT256_MAX, "Tweak >= G" }
};

const std::vector<B<uint8_t_64>> BAD_SIGNATURES_VERIFY = {
	{ _signatureFromRS(ZERO, ZERO), "Invalid r, s values (== 0)" },
	{ _signatureFromRS(ZERO, ONE), "Invalid r value (== 0)" },
	{ _signatureFromRS(ONE, ZERO), "Invalid s value (== 0)" },
};

const std::vector<B<uint8_t_64>> BAD_SIGNATURES = {
	{ _signatureFromRS(GROUP_ORDER, ONE), "Invalid r value (>= n)" },
	{ _signatureFromRS(ONE, GROUP_ORDER), "Invalid s value (>= n)" }
};

// from https://github.com/cryptocoinjs/ecurve/blob/14d72f5f468d53ff33dc13c1c7af350a41d52aab/test/fixtures/point.json#L84
template <typename A = uint8_t_33>
std::vector<B<uint8_t_vec>> generateBadPoints () {
	return {
		{ _pointFromX(ONE, 0x01), "Bad sequence prefix" },
		{ _pointFromX(ONE, 0x04), "Bad sequence prefix" },
		{ _pointFromX(ONE, 0x05), "Bad sequence prefix" },
		{ _pointFromX(ZERO, 0x02), "Bad X coordinate (== 0)" },
		{ _pointFromX(ZERO, 0x03), "Bad X coordinate (== 0)" },
		{ _pointFromX(P, 0x02), "Bad X coordinate (== P)" },
		{ _pointFromX(P, 0x03), "Bad X coordinate (== P)" },
		{ _pointFromX(P_OVER_1, 0x03), "Bad X coordinate (> P)" },
	};
}

template <>
std::vector<B<uint8_t_vec>> generateBadPoints<uint8_t_65> () {
	return {
		{ _pointFromXY(ONE, ONE, 0x01), "Bad sequence prefix" },
		{ _pointFromXY(ONE, ONE, 0x02), "Bad sequence prefix" },
		{ _pointFromXY(ONE, ONE, 0x03), "Bad sequence prefix" },
		{ _pointFromXY(ONE, ONE, 0x05), "Bad sequence prefix" },
		{ _pointFromXY(ZERO, ONE), "Bad X coordinate (== 0)" },
		{ _pointFromXY(ONE, ZERO), "Bad Y coordinate (== 0)" },
		{ _pointFromXY(ZERO, ZERO, 0x04), "Bad X/Y coordinate (== 0)" },
		{ _pointFromXY(P, ONE), "Bad X coordinate (== P)" },
		{ _pointFromXY(ONE, P), "Bad Y coordinate (== P)" },
		{ _pointFromXY(P_OVER_1, ONE), "Bad X coordinate (> P)" },
		{ _pointFromXY(ONE, P_OVER_1), "Bad Y coordinate (> P)" },
	};
}

const auto THROW_BAD_PRIVATE = "Expected Private";
const auto THROW_BAD_POINT = "Expected Point";
const auto THROW_BAD_TWEAK = "Expected Tweak";
const auto THROW_BAD_HASH = "Expected Hash";
const auto THROW_BAD_SIGNATURE = "Expected Signature";
