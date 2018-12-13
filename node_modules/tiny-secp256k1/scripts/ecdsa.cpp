#include <iostream>
#include <tuple>
#include <vector>
#include "shared.hpp"

/////////// bitcoinjs-lib/ecdsa test fixtures
// https://github.com/bitcoinjs/bitcoinjs-lib/blob/6b3c41a06c6e38ec79dc2f3389fa2362559b4a46/test/fixtures/ecdsa.json
const auto BJS_KEYS = std::vector<std::string>({
	"0000000000000000000000000000000000000000000000000000000000000001",
	"fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140",
	"fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140",
	"0000000000000000000000000000000000000000000000000000000000000001",
	"69ec59eaa1f4f2e36b639716b7c30ca86d9a5375c7b38d8918bd9c0ebc80ba64",
	"00000000000000000000000000007246174ab1e92e9149c6e446fe194d072637",
	"000000000000000000000000000000000000000000056916d0f9b31dc9b637f3",
});
const auto BJS_MESSAGES = std::vector<std::string>({
	"Everything should be made as simple as possible, but not simpler.",
	"Equations are more important to me, because politics is for the present, but an equation is something for eternity.",
	"Not only is the Universe stranger than we think, it is stranger than we can think.",
	"How wonderful that we have met with a paradox. Now we have some hope of making progress.",
	"Computer science is no more about computers than astronomy is about telescopes.",
	"...if you aren't, at any given time, scandalized by code you wrote five or even three years ago, you're not learning anywhere near enough",
	"The question of whether computers can think is like the question of whether submarines can swim.",
});

struct S { uint8_t_32 d; uint8_t_32 m; uint8_t_64 e; std::string desc; };
auto generateSigns () {
	bool ok = true;
	std::vector<S> s;

	size_t i = 0;
	for (const auto& message : BJS_MESSAGES) {
		const auto d = scalarFromHex(BJS_KEYS[i++]);
		const auto hash = sha256(message);
		const auto sig = _eccSign(d, hash, ok);
		s.push_back({ d, hash, sig, message });
	}

	for (const auto& message : BJS_MESSAGES) {
		const auto d = randomPrivate();
		const auto hash = sha256(message);
		const auto sig = _eccSign(d, hash, ok);
		s.push_back({ d, hash, sig, message });
	}

	s.push_back({ ONE, ZERO, _eccSign(ONE, ZERO, ok), "Strange hash" });
	s.push_back({ ONE, UINT256_MAX, _eccSign(ONE, UINT256_MAX, ok), "Strange hash" });
	s.push_back({ GROUP_ORDER_LESS_1, ZERO, _eccSign(GROUP_ORDER_LESS_1, ZERO, ok), "Stange hash" });
	s.push_back({ GROUP_ORDER_LESS_1, UINT256_MAX, _eccSign(GROUP_ORDER_LESS_1, UINT256_MAX, ok), "Strange hash" });

	// fuzz
	for (int i = 0; i < 2000; i++) {
		const auto rkey = randomPrivate();
		const auto hash = randomScalar();
		auto sig = _eccSign(rkey, hash, ok);
		const auto Q = _pointFromScalar<uint8_t_33>(rkey, ok);
		assert(ok);
		auto verified = ok;
		assert(_eccVerify(Q, hash, sig) == verified);

		s.push_back({ rkey, hash, sig, "" });
	}

	return s;
}

struct BS { uint8_t_32 d; uint8_t_32 m; std::string except; std::string desc = ""; };
auto generateBadSigns () {
	std::vector<BS> bs;
	for (auto x : BAD_PRIVATES) bs.push_back({ x.a, ONE, THROW_BAD_PRIVATE, x.desc });
	return bs;
}

struct BV { uint8_t_vec Q; uint8_t_32 m; uint8_t_64 s; std::string except; std::string desc = ""; };
auto generateBadVerify () {
	bool ok = true;
	const auto G_ONE = _pointFromUInt32<uint8_t_33>(1, ok);
	assert(ok);
	const auto BAD_POINTS = generateBadPoints<uint8_t_65>();
	const auto BAD_POINTS_C = generateBadPoints<uint8_t_33>();

	std::vector<BV> bv;
	for (auto x : BAD_POINTS) bv.push_back({ x.a, THREE, _signatureFromRS(ONE, ONE), THROW_BAD_POINT, x.desc });
	for (auto x : BAD_POINTS_C) bv.push_back({ x.a, THREE, _signatureFromRS(ONE, ONE), THROW_BAD_POINT, x.desc });

	for (auto x : BAD_SIGNATURES_VERIFY) bv.push_back({ G_ONE, THREE, x.a, "", x.desc }); // never verify, but dont throw
	for (auto x : BAD_SIGNATURES) bv.push_back({ G_ONE, THREE, x.a, THROW_BAD_SIGNATURE, x.desc });
	return bv;
}

template <typename T>
void dumpJSON (std::ostream& o, const T& t) {
	o << jsonifyO({
		jsonp("valid", jsonifyA(std::get<0>(t), [&](auto x) {
			return jsonifyO({
				x.desc.empty() ? "" : jsonp("description", jsonify(x.desc)),
				jsonp("d", jsonify(x.d)),
				jsonp("m", jsonify(x.m)),
				jsonp("signature", jsonify(x.e))
			});
		})),
		jsonp("invalid", jsonifyO({
			jsonp("sign", jsonifyA(std::get<1>(t), [&](auto x) {
				return jsonifyO({
					x.desc.empty() ? "" : jsonp("description", jsonify(x.desc)),
					jsonp("exception", jsonify(x.except)),
					jsonp("d", jsonify(x.d)),
					jsonp("m", jsonify(x.m))
				});
			})),
			jsonp("verify", jsonifyA(std::get<2>(t), [&](auto x) {
				return jsonifyO({
					x.desc.empty() ? "" : jsonp("description", jsonify(x.desc)),
					x.except.empty() ? "" : jsonp("exception", jsonify(x.except)),
					jsonp("Q", jsonify(x.Q)),
					jsonp("m", jsonify(x.m)),
					jsonp("signature", jsonify(x.s))
				});
			}))
		}))
	});
}

int main () {
	_ec_init();
	const auto s = generateSigns();
	const auto bs = generateBadSigns();
	const auto bv = generateBadVerify();

	dumpJSON(std::cout, std::make_tuple(s, bs, bv));

	return 0;
}
