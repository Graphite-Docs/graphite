#include <array>
#include <cstdlib>

#include <nan.h>
#include <secp256k1.h>

#define THROW_BAD_ARGUMENTS Nan::ThrowTypeError("Not enough arguments")
#define THROW_BAD_PRIVATE Nan::ThrowTypeError("Expected Private")
#define THROW_BAD_POINT Nan::ThrowTypeError("Expected Point")
#define THROW_BAD_TWEAK Nan::ThrowTypeError("Expected Tweak")
#define THROW_BAD_HASH Nan::ThrowTypeError("Expected Hash")
#define THROW_BAD_SIGNATURE Nan::ThrowTypeError("Expected Signature")
#define EXPECT_ARGS(N) if (info.Length() < N) return THROW_BAD_ARGUMENTS

#define RETURNV(X) info.GetReturnValue().Set(X)

secp256k1_context* context;

namespace {
	const std::array<uint8_t, 32> ZERO = {};
	const std::array<uint8_t, 32> GROUP_ORDER = {
		0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe,
		0xba, 0xae, 0xdc, 0xe6, 0xaf, 0x48, 0xa0, 0x3b, 0xbf, 0xd2, 0x5e, 0x8c, 0xd0, 0x36, 0x41, 0x41,
	};

	v8::Local<v8::Object> asBuffer (const unsigned char* data, const size_t length) {
		return Nan::CopyBuffer(reinterpret_cast<const char*>(data), static_cast<uint32_t>(length)).ToLocalChecked();
	}

	template <typename T>
	const unsigned char* asDataPointer (const T& x) {
		return reinterpret_cast<const unsigned char*>(node::Buffer::Data(x));
	}

	template <typename T>
	bool isScalar (const T& x) {
		return node::Buffer::HasInstance(x) && node::Buffer::Length(x) == 32;
	}

	template <typename T>
	bool isOrderScalar (const T& x) {
		if (!isScalar<T>(x)) return false;
		return memcmp(asDataPointer(x), GROUP_ORDER.data(), 32) < 0;
	}

	template <typename T>
	bool isPrivate (const T& x) {
		if (!isScalar<T>(x)) return false;
		return secp256k1_ec_seckey_verify(context, asDataPointer(x)) != 0;
	}

	template <typename T>
	bool isPoint (const T& x, secp256k1_pubkey& pubkey) {
		if (!node::Buffer::HasInstance(x)) return false;
		return secp256k1_ec_pubkey_parse(context, &pubkey, asDataPointer(x), node::Buffer::Length(x)) != 0;
	}

	template <typename A>
	bool __isPointCompressed (const A& x) {
		return node::Buffer::Length(x) == 33;
	}

	template <typename T>
	bool isSignature (const T& x, secp256k1_ecdsa_signature& signature) {
		if (!node::Buffer::HasInstance(x)) return false;
		if (node::Buffer::Length(x) != 64) return false;
		return secp256k1_ecdsa_signature_parse_compact(context, &signature, asDataPointer(x)) != 0;
	}

	v8::Local<v8::Object> pointAsBuffer (const secp256k1_pubkey& public_key, const uint32_t flags) {
		unsigned char output[65];
		size_t output_length = 65;
		secp256k1_ec_pubkey_serialize(context, output, &output_length, &public_key, flags);
		return asBuffer(output, output_length);
	}

	template <size_t index, typename I, typename A>
	unsigned int assumeCompression (const I& info, const A& p) {
		if (info.Length() <= index) return __isPointCompressed(p) ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED;
		if (info[index]->IsUndefined()) return SECP256K1_EC_COMPRESSED;
		return info[index]->BooleanValue() ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED;
	}

	template <size_t index, typename I>
	unsigned int assumeCompression (const I& info) {
		if (info.Length() <= index) return SECP256K1_EC_COMPRESSED;
		if (info[index]->IsUndefined()) return SECP256K1_EC_COMPRESSED;
		return info[index]->BooleanValue() ? SECP256K1_EC_COMPRESSED : SECP256K1_EC_UNCOMPRESSED;
	}
}

// returns Bool
NAN_METHOD(eccIsPoint) {
	Nan::HandleScope scope;
	EXPECT_ARGS(1);

	const auto p = info[0].As<v8::Object>();

	secp256k1_pubkey public_key;
	return RETURNV(isPoint(p, public_key));
}

// returns Bool
NAN_METHOD(eccIsPointCompressed) {
	Nan::HandleScope scope;
	EXPECT_ARGS(1);

	const auto p = info[0].As<v8::Object>();

	secp256k1_pubkey public_key;
	if (!isPoint(p, public_key)) return THROW_BAD_POINT;

	return RETURNV(__isPointCompressed(p));
}

// returns Bool
NAN_METHOD(eccIsPrivate) {
	Nan::HandleScope scope;
	EXPECT_ARGS(1);

	const auto d = info[0].As<v8::Object>();
	return RETURNV(isPrivate(d));
}

// returns ?Point
NAN_METHOD(eccPointAdd) {
	Nan::HandleScope scope;
	EXPECT_ARGS(2);

	const auto pA = info[0].As<v8::Object>();
	const auto pB = info[1].As<v8::Object>();

	secp256k1_pubkey a, b;
	if (!isPoint(pA, a)) return THROW_BAD_POINT;
	if (!isPoint(pB, b)) return THROW_BAD_POINT;

	const secp256k1_pubkey* points[] = { &a, &b };
	secp256k1_pubkey p;
	if (secp256k1_ec_pubkey_combine(context, &p, points, 2) == 0) return RETURNV(Nan::Null());

	const auto flags = assumeCompression<2>(info, pA);
	return RETURNV(pointAsBuffer(p, flags));
}

// returns ?Point
NAN_METHOD(eccPointAddScalar) {
	Nan::HandleScope scope;
	EXPECT_ARGS(2);

	const auto p = info[0].As<v8::Object>();
	const auto tweak = info[1].As<v8::Object>();

	secp256k1_pubkey public_key;
	if (!isPoint(p, public_key)) return THROW_BAD_POINT;
	if (!isOrderScalar(tweak)) return THROW_BAD_TWEAK;

	if (secp256k1_ec_pubkey_tweak_add(context, &public_key, asDataPointer(tweak)) == 0) return RETURNV(Nan::Null());

	const auto flags = assumeCompression<2>(info, p);
	return RETURNV(pointAsBuffer(public_key, flags));
}

// returns Point
NAN_METHOD(eccPointCompress) {
	Nan::HandleScope scope;
	EXPECT_ARGS(1);

	const auto p = info[0].As<v8::Object>();

	secp256k1_pubkey public_key;
	if (!isPoint(p, public_key)) return THROW_BAD_POINT;

	const auto flags = assumeCompression<1>(info, p);
	return RETURNV(pointAsBuffer(public_key, flags));
}

// returns ?Point
NAN_METHOD(eccPointFromScalar) {
	Nan::HandleScope scope;
	EXPECT_ARGS(1);

	const auto d = info[0].As<v8::Object>();
	if (!isPrivate(d)) return THROW_BAD_PRIVATE;

	secp256k1_pubkey public_key;
	if (secp256k1_ec_pubkey_create(context, &public_key, asDataPointer(d)) == 0) return RETURNV(Nan::Null());

	const auto flags = assumeCompression<1>(info);
	return RETURNV(pointAsBuffer(public_key, flags));
}

// returns ?Point
NAN_METHOD(eccPointMultiply) {
	Nan::HandleScope scope;
	EXPECT_ARGS(2);

	const auto p = info[0].As<v8::Object>();
	const auto tweak = info[1].As<v8::Object>();

	secp256k1_pubkey public_key;
	if (!isPoint(p, public_key)) return THROW_BAD_POINT;
	if (!isOrderScalar(tweak)) return THROW_BAD_TWEAK;

	if (secp256k1_ec_pubkey_tweak_mul(context, &public_key, asDataPointer(tweak)) == 0) return RETURNV(Nan::Null());

	const auto flags = assumeCompression<2>(info, p);
	return RETURNV(pointAsBuffer(public_key, flags));
}

// returns ?Secret
NAN_METHOD(eccPrivateAdd) {
	Nan::HandleScope scope;
	EXPECT_ARGS(2);

	const auto d = info[0].As<v8::Object>();
	const auto tweak = info[1].As<v8::Object>();
	if (!isPrivate(d)) return THROW_BAD_PRIVATE;
	if (!isOrderScalar(tweak)) return THROW_BAD_TWEAK;

	unsigned char output[32];
	memcpy(output, asDataPointer(d), 32);
	if (secp256k1_ec_privkey_tweak_add(context, output, asDataPointer(tweak)) == 0) return RETURNV(Nan::Null());

	return RETURNV(asBuffer(output, 32));
}

// returns ?Secret
NAN_METHOD(eccPrivateSub) {
	Nan::HandleScope scope;
	EXPECT_ARGS(2);

	const auto d = info[0].As<v8::Object>();
	const auto tweak = info[1].As<v8::Object>();
	if (!isPrivate(d)) return THROW_BAD_PRIVATE;
	if (!isOrderScalar(tweak)) return THROW_BAD_TWEAK;

	unsigned char tweak_negated[32];
	memcpy(tweak_negated, asDataPointer(tweak), 32);
	secp256k1_ec_privkey_negate(context, tweak_negated); // returns 1 always

	unsigned char output[32];
	memcpy(output, asDataPointer(d), 32);
	if (secp256k1_ec_privkey_tweak_add(context, output, tweak_negated) == 0) return RETURNV(Nan::Null());

	return RETURNV(asBuffer(output, 32));
}

// returns Signature
NAN_METHOD(ecdsaSign) {
	Nan::HandleScope scope;
	EXPECT_ARGS(2);

	const auto hash = info[0].As<v8::Object>();
	const auto d = info[1].As<v8::Object>();
	if (!isScalar(hash)) return THROW_BAD_HASH;
	if (!isPrivate(d)) return THROW_BAD_PRIVATE;

	secp256k1_ecdsa_signature signature;
	if (secp256k1_ecdsa_sign(
		context,
		&signature,
		asDataPointer(hash),
		asDataPointer(d),
		secp256k1_nonce_function_rfc6979,
		nullptr
	) == 0) return THROW_BAD_SIGNATURE;

	unsigned char output[64];
	secp256k1_ecdsa_signature_serialize_compact(context, output, &signature);

	return RETURNV(asBuffer(output, 64));
}

// returns Bool
NAN_METHOD(ecdsaVerify) {
	Nan::HandleScope scope;
	EXPECT_ARGS(3);

	const auto hash = info[0].As<v8::Object>();
	const auto p = info[1].As<v8::Object>();
	const auto sig = info[2].As<v8::Object>();
	auto strict = false;
	if (info.Length() > 3 && !info[3]->IsUndefined()) {
		strict = info[3]->BooleanValue();
	}

	secp256k1_pubkey public_key;
	secp256k1_ecdsa_signature signature;

	if (!isScalar(hash)) return THROW_BAD_HASH;
	if (!isPoint(p, public_key)) return THROW_BAD_POINT;
	if (!isSignature(sig, signature)) return THROW_BAD_SIGNATURE;
	if (!strict) {
		const auto copy = signature;
		secp256k1_ecdsa_signature_normalize(context, &signature, &copy);
	}

	const auto result = secp256k1_ecdsa_verify(context, &signature, asDataPointer(hash), &public_key) == 1;
	return RETURNV(result);
}

NAN_MODULE_INIT(Init) {
  context = secp256k1_context_create(SECP256K1_CONTEXT_SIGN | SECP256K1_CONTEXT_VERIFY);

  // ecc
  Nan::Export(target, "isPoint", eccIsPoint);
  Nan::Export(target, "isPointCompressed", eccIsPointCompressed);
  Nan::Export(target, "isPrivate", eccIsPrivate);
  Nan::Export(target, "pointAdd", eccPointAdd);
  Nan::Export(target, "pointAddScalar", eccPointAddScalar);
  Nan::Export(target, "pointCompress", eccPointCompress);
  Nan::Export(target, "pointFromScalar", eccPointFromScalar);
  Nan::Export(target, "pointMultiply", eccPointMultiply);
  Nan::Export(target, "privateAdd", eccPrivateAdd);
  Nan::Export(target, "privateSub", eccPrivateSub);

  // ecdsa
  Nan::Export(target, "sign", ecdsaSign);
  Nan::Export(target, "verify", ecdsaVerify);
}

NODE_MODULE(secp256k1, Init)
