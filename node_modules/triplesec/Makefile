
ICED=node_modules/.bin/iced
RSP2JSON=node_modules/.bin/rsp2json
BROWSERIFY=node_modules/.bin/browserify
BUILD_STAMP=build-stamp
TEST_STAMP=test-stamp
UGLIFYJS=node_modules/.bin/uglifyjs
WD=`pwd`

BROWSER=browser/triplesec.js

default: build
all: build

lib/%.js: src/%.iced
	$(ICED) -I browserify -c -o lib $<

$(BUILD_STAMP): \
	lib/main.js \
	lib/wordarray.js \
	lib/algbase.js \
	lib/sha512.js \
	lib/util.js \
	lib/hmac.js \
	lib/aes.js \
	lib/twofish.js \
	lib/ctr.js \
	lib/salsa20.js \
	lib/pbkdf2.js \
	lib/enc.js \
	lib/dec.js \
	lib/prng.js \
	lib/drbg.js \
	lib/sha3.js \
	lib/combine.js \
	lib/sha256.js \
	lib/sha224.js \
	lib/sha384.js \
	lib/sha1.js \
	lib/scrypt.js \
	lib/md5.js \
	lib/ripemd160.js
	date > $@

$(BROWSER): lib/main.js $(BUILD_STAMP)
	$(BROWSERIFY) -s triplesec $< > $@

build: $(BUILD_STAMP) $(BROWSER) site

site: site/js/site.js

site/js/site.js: site/iced/site.iced
	$(ICED) -I window --print $< > $@

test-server: $(TEST_STAMP) $(BUILD_STAMP)
	$(ICED) test/run.iced

test-browser-buffer: $(TEST_STAMP) $(BUILD_STAMP)
	$(ICED) test/run.iced -b 

test/browser/test.js: test/browser/main.iced $(BUILD_STAMP)
	$(BROWSERIFY) -t icsify $< > $@

test/browser/bench.js: test/browser/bench.iced $(BUILD_STAMP)
	$(BROWSERIFY) -t icsify -s bench $< > $@

test-browser: $(TEST_STAMP) $(BUILD_STAMP)
	@echo "Please visit in your favorite browser --> file://$(WD)/test/browser/index.html"

test/json/HMAC_DRBG_reseed.json: test/rsp/HMAC_DRBG_reseed.rsp
	@mkdir -p test/json/
	$(RSP2JSON) $< > $@

test/json/sha%.json: test/rsp/sha%.rsp
	@mkdir -p test/json/
	$(RSP2JSON) $< > $@
	
test/json/SHA3_long.json: test/rsp/SHA3_long.rsp
	@mkdir -p test/json/
	$(RSP2JSON) $< > $@

test/json/SHA1ShortMsg.json: test/rsp/SHA1ShortMsg.rsp
	@mkdir -p test/json/
	$(RSP2JSON) $< > $@
	
test/json/SHA1LongMsg.json: test/rsp/SHA1LongMsg.rsp
	@mkdir -p test/json/
	$(RSP2JSON) $< > $@

spec/triplesec_v1.json: ref/gen_triplesec_spec.iced
	$(ICED) $< -v 1 > $@
spec/triplesec_v2.json: ref/gen_triplesec_spec.iced
	$(ICED) $< -v 2 > $@
spec/triplesec_v3.json: ref/gen_triplesec_spec.iced
	$(ICED) $< -v 3 > $@
spec/pbkdf2_sha512_sha3.json: ref/gen_pbkdf2_sha512_sha3_spec.iced
	$(ICED) $< $ > $@
spec/scrypt_xor.json: ref/gen_scrypt_xor_spec.iced
	$(ICED) $< $ > $@

test/data/triplesec_spec_v%.js: spec/triplesec_v%.json 
	$(ICED) test/gen/spec2js.iced "../../$<" > $@

test/data/pbkdf2_sha512_sha3_spec.js: spec/pbkdf2_sha512_sha3.json 
	$(ICED) test/gen/spec2js.iced "../../spec/pbkdf2_sha512_sha3.json" > $@
test/data/scrypt_xor_spec.js: spec/scrypt_xor.json 
	$(ICED) test/gen/spec2js.iced "../../spec/scrypt_xor.json" > $@

test/json/md5.json: test/gen/gen_md5.iced
	@mkdir -p test/json
	$(ICED) $< > $@

$(TEST_STAMP): test/data/twofish_ecb_tbl.js \
		test/data/salsa20_key128.js \
		test/data/salsa20_key256.js \
		test/data/pbkdf2.js \
		test/data/drbg_hmac_no_reseed.js \
		test/json/HMAC_DRBG_reseed.json \
		test/json/md5.json \
		test/data/drbg_hmac_reseed.js \
		test/data/sha3_short.js \
		test/data/sha3_long.js \
		test/data/sha512_long.js \
		test/data/sha512_short.js \
		test/data/sha1_short.js \
		test/data/sha1_long.js \
		test/data/sha256_short.js \
		test/data/sha256_long.js \
		test/data/sha224_long.js \
		test/data/sha224_short.js \
		test/data/sha384_long.js \
		test/data/sha384_short.js \
		test/data/triplesec_spec_v1.js \
		test/data/triplesec_spec_v2.js \
		test/data/triplesec_spec_v3.js \
		test/data/pbkdf2_sha512_sha3_spec.js \
		test/data/scrypt_xor_spec.js \
		test/browser/test.js 
	date > $@

release: browser/triplesec.js
	V=`jq -r .version < package.json` ; \
	cp $< rel/triplesec-$$V.js ; \
	$(UGLIFYJS) -c < rel/triplesec-$$V.js > rel/triplesec-$$V-min.js 

test/data/sha%.js: test/json/sha%.json
	@mkdir -p test/data
	$(ICED) test/gen/gen_sha.iced "../../$<" > $@

test/data/%.js: test/gen/gen_%.iced
	@mkdir -p test/data
	$(ICED) $< > $@

spec: spec/triplesec.json spec/pbkdf2_sha512_sha3.json

test: test-server test-browser

clean:
	rm -f lib/*.js $(BUILD_STAMP) $(TEST_STAMP)

doc:
	node_modules/.bin/codo

setup:
	npm install -d

.PHONY: clean setup test test-browser-buffer doc spec

