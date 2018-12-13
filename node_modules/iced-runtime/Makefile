default: build
all: build

ICED=node_modules/.bin/iced
BUILD_STAMP=build-stamp
TEST_STAMP=test-stamp

lib/%.js: src/%.iced
	$(ICED) -I none -c -o `dirname $@` $<

$(BUILD_STAMP): \
	lib/const.js \
	lib/library.js \
	lib/main.js \
	lib/runtime.js 
	date > $@

clean:
	find lib -type f -name *.js -exec rm {} \;

build: $(BUILD_STAMP) 

setup: 
	npm install -d

test:
	iced test/run.iced

.PHONY: test setup

