#include <iostream>
#include <vector>
#include "shared.hpp"

struct IP { uint8_t_32 a = {}; bool e = false; std::string desc = ""; };
struct PA { uint8_t_32 a; uint8_t_32 b; uint8_t_32 e = Null<uint8_t_32>(); std::string except = ""; std::string desc = ""; };

void generate (std::ostream& o) {
	///////////////////////////////// isPrivate

	// edge cases (verify)
	//   from https://github.com/bitcoin-core/secp256k1/blob/6ad5cdb42a1a8257289a0423d644dcbdeab0f83c/src/tests.c
	std::vector<IP> ip = {
		{ ZERO, false, "== 0" }, // #L3145
		{ ONE, true, "== 1" }, // #L3153
		{ GROUP_ORDER_LESS_1, true, "== G - 1" }, // #L3171
		{ GROUP_ORDER, false, "== G" }, // #L3115
		{ GROUP_ORDER_OVER_1, false, "> G" }, // #L3162
		{ UINT256_MAX, false, "2^256 - 1" }, // #L3131
	};

	// fuzz
	for (size_t i = 0; i < 1000; ++i) {
		ip.push_back({ randomPrivate(), true });
	}
	for (size_t i = 0; i < 1000; ++i) {
		const auto key = randomScalarHigh();
		const auto verified = secp256k1_ec_seckey_verify(ctx, key.data());

		ip.push_back({ key, verified });
	}

	///////////////////////////////// privateAdd
	std::vector<PA> pa;

	// visually inspected
	//   covers https://github.com/bitcoin-core/secp256k1/blob/6ad5cdb42a1a8257289a0423d644dcbdeab0f83c/src/tests.c
	pa.push_back({ ONE, ZERO, ONE, "", "1 + 0 == 1" });
	for (size_t i = 1; i < 5; ++i) pa.push_back({ ONE, scalarFromUInt32(i), scalarFromUInt32(1 + i) });
	for (size_t i = 1; i < 5; ++i) pa.push_back({ scalarFromUInt32(i), TWO, scalarFromUInt32(i + 2) });

	pa.push_back({ ONE, GROUP_ORDER_LESS_1, Null<uint8_t_32>(), "", "1 + -1 == 0" });
	pa.push_back({ ONE, GROUP_ORDER_LESS_2, GROUP_ORDER_LESS_1, "", "1 + -2 == -1" });
	pa.push_back({ ONE, GROUP_ORDER_LESS_3, GROUP_ORDER_LESS_2, "", "1 + -3 == -2" });
	pa.push_back({ GROUP_ORDER_LESS_1, GROUP_ORDER_LESS_1, GROUP_ORDER_LESS_2 });
	pa.push_back({ GROUP_ORDER_LESS_2, GROUP_ORDER_LESS_1, GROUP_ORDER_LESS_3 });
	pa.push_back({ GROUP_ORDER_LESS_3, ONE, GROUP_ORDER_LESS_2 });
	pa.push_back({ GROUP_ORDER_LESS_3, TWO, GROUP_ORDER_LESS_1, "", "-3 + 2 == -1" });
	pa.push_back({ GROUP_ORDER_LESS_3, THREE, Null<uint8_t_32>(), "", "-3 + 3 == 0" });

	// fuzz
	for (size_t i = 0; i < 10000; ++i) {
		const auto paPush = [&](const auto k, const auto t) {
			bool ok = true;
			const auto expected = _privAdd(k, t, ok);
			if (ok) pa.push_back({ k, t, expected });
			else pa.push_back({ k, t, Null<uint8_t_32>() });
		};

		paPush(randomPrivate(), randomPrivate());
		paPush(randomPrivateHigh(), randomPrivateLow());
		paPush(randomPrivateLow(), randomPrivateHigh());
	}

	std::vector<PA> paf;
	for (const auto x : BAD_PRIVATES) paf.push_back({ x.a, ONE, {}, THROW_BAD_PRIVATE, x.desc });
	for (const auto x : BAD_TWEAKS) paf.push_back({ ONE, x.a, {}, THROW_BAD_TWEAK, x.desc });

	///////////////////////////////// privateSub
	std::vector<PA> ps;

	// visually inspected
	//   covers https://github.com/bitcoin-core/secp256k1/blob/6ad5cdb42a1a8257289a0423d644dcbdeab0f83c/src/tests.c
	ps.push_back({ ONE, ZERO, ONE, "", "1 - 0 == 1" });
	for (size_t i = 2; i < 7; ++i) ps.push_back({ scalarFromUInt32(i), ONE, scalarFromUInt32(i - 1) });
	for (size_t i = 1; i < 10; ++i) ps.push_back({ scalarFromUInt32(10), scalarFromUInt32(i), scalarFromUInt32(10 - i) });

	ps.push_back({ ONE, ONE, Null<uint8_t_32>(), "", "1 - 1 == 0" });
	ps.push_back({ THREE, THREE, Null<uint8_t_32>(), "", "3 - 3 == 0" });
	ps.push_back({ GROUP_ORDER_LESS_1, ONE, GROUP_ORDER_LESS_2 });
	ps.push_back({ GROUP_ORDER_LESS_2, ONE, GROUP_ORDER_LESS_3 });
	ps.push_back({ GROUP_ORDER_LESS_1, GROUP_ORDER_LESS_2, ONE });
	ps.push_back({ GROUP_ORDER_LESS_2, GROUP_ORDER_LESS_3, ONE });

	// fuzz
	for (size_t i = 0; i < 1000; ++i) {
		const auto psPush = [&](const auto k, const auto t) {
			bool ok = true;
			const auto expected = _privSub(k, t, ok);
			if (ok) ps.push_back({ k, t, expected });
			else ps.push_back({ k, t, Null<uint8_t_32>() });
		};

		psPush(randomPrivate(), randomPrivate());
		psPush(randomPrivateHigh(), randomPrivateLow());
		psPush(randomPrivateLow(), randomPrivateHigh());
	}

	std::vector<PA> psf;
	for (const auto x : BAD_PRIVATES) psf.push_back({ x.a, ONE, {}, THROW_BAD_PRIVATE, x.desc });
	for (const auto x : BAD_TWEAKS) psf.push_back({ ONE, x.a, {}, THROW_BAD_TWEAK, x.desc });

	// dump JSON
	const auto jPA = [](auto x) {
		return jsonifyO({
			x.desc.empty() ? "" : jsonp("description", jsonify(x.desc)),
			jsonp("d", jsonify(x.a)),
			jsonp("tweak", jsonify(x.b)),
			x.except.empty() ? jsonp("expected", isNull(x.e) ? "null" : jsonify(x.e)) : "",
			x.except.empty() ? "" : jsonp("exception", jsonify(x.except))
		});
	};

	o << jsonifyO({
		jsonp("valid", jsonifyO({
			jsonp("isPrivate", jsonifyA(ip, [](auto x) {
				return jsonifyO({
					x.desc.empty() ? "" : jsonp("description", jsonify(x.desc)),
					jsonp("d", jsonify(x.a)),
					jsonp("expected", jsonify(x.e))
				});
			})),
			jsonp("privateAdd", jsonifyA(pa, jPA)),
			jsonp("privateSub", jsonifyA(ps, jPA))
		})),
		jsonp("invalid", jsonifyO({
			jsonp("privateAdd", jsonifyA(paf, jPA)),
			jsonp("privateSub", jsonifyA(psf, jPA))
		}))
	});
}

int main () {
	_ec_init();
	generate(std::cout);

	return 0;
}
