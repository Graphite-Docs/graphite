#include <sstream>
#include <type_traits>

#include "hexxer.hpp"

template <typename R>
auto hexify (const R& range) {
	std::stringstream ss;
	for (auto& x : range) {
		ss << hexxer::encodeFirst(x) << hexxer::encodeSecond(x);
	}
	return ss.str();
}

auto jsonify (const std::string& v) {
	return "\"" + v + "\"";
}

template <typename R>
std::enable_if_t<std::is_same<typename R::value_type, uint8_t>::value, std::string>
jsonify (const R& r) {
	return jsonify(hexify<R>(r));
}

auto jsonp (const std::string& k, const std::string& v) {
	std::stringstream ss;
	ss << "\"" << k << "\": " << v;
	return ss.str();
}

auto jsonify (const bool v) {
	return v ? "true" : "false";
}

template <char L = ' ', char R = ' ', typename Range, typename F>
auto jsonify_csv (const Range r, F f) {
	std::stringstream ss;
	size_t i = 0;
	if (L != ' ') ss << L;
	for (const auto& x : r) {
		const auto fx = f(x);
		if (fx.empty()) continue;
		if (i++ > 0) ss << ',';
		ss << fx;
	}
	if (R != ' ') ss << R;
	return ss.str();
}

auto json_identity (const std::string& s) { return s; }

template <typename R = std::initializer_list<std::string>, typename F = decltype(json_identity)>
auto jsonifyO (const R& r, F f = json_identity) {
	return jsonify_csv<'{', '}'>(r, f);
}

template <typename R = std::initializer_list<std::string>, typename F = decltype(json_identity)>
auto jsonifyA (const R& r, F f = json_identity) {
	return jsonify_csv<'[', ']'>(r, f);
}
