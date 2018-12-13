
ICED=node_modules/.bin/iced

FILES = lib/generator.js \
	lib/main.js \

default: $(FILES)

all: $(FILES)

lib/%.js: src/%.iced
	$(ICED) -I browserify -c -o lib $<

test: $(FILES)
	$(ICED) test/test.iced

.PHONY: test