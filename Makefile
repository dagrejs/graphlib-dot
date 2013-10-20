# Binaries we use
NODE = node
NPM = npm

BROWSERIFY = ./node_modules/browserify/bin/cmd.js
ISTANBUL = ./node_modules/istanbul/lib/cli.js
JSHINT = ./node_modules/jshint/bin/jshint
MOCHA = ./node_modules/mocha/bin/_mocha
PEGJS = ./node_modules/pegjs/bin/pegjs
PHANTOMJS = ./node_modules/phantomjs/bin/phantomjs
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs

# Module def
MODULE = graphlib-dot
MODULE_JS = $(MODULE).js
MODULE_MIN_JS = $(MODULE).min.js

# Various files
SRC_FILES = index.js lib/dot-grammar.js lib/version.js $(shell find lib -type f -name '*.js')
TEST_FILES = $(shell find test -type f -name '*.js')

TEST_COV = build/coverage

# Targets
.PHONY: = all test lint release clean fullclean

.DELETE_ON_ERROR:

all: build test

lib/dot-grammar.js: src/dot-grammar.pegjs
	$(NODE) $(PEGJS) -e 'module.exports' $< $@

lib/version.js: package.json
	node src/version.js > $@

build: build/$(MODULE_JS) build/$(MODULE_MIN_JS)

build/$(MODULE_JS): browser.js node_modules $(SRC_FILES)
	mkdir -p $(@D)
	$(BROWSERIFY) $(BROWSERIFY_OPTS) $< > $@

build/$(MODULE_MIN_JS): build/$(MODULE_JS)
	$(UGLIFY) $(UGLIFY_OPTS) $< > $@

dist: build/$(MODULE_JS) build/$(MODULE_MIN_JS) | test
	rm -rf $@
	mkdir -p $@
	cp -r $^ dist

test: $(TEST_COV) lint

$(TEST_COV): $(TEST_FILES) $(SRC_FILES) node_modules
	rm -rf $@
	$(ISTANBUL) cover $(MOCHA) --dir $@ -- $(MOCHA_OPTS) $(TEST_FILES)

lint: build/lint

build/lint: browser.js $(filter-out lib/dot-grammar.js, $(SRC_FILES)) $(TEST_FILES) | lib/dot-grammar.js
	mkdir -p $(@D)
	$(JSHINT) $?
	touch $@
	@echo

release: dist
	src/release/release.sh $(MODULE) dist

clean:
	rm -rf build dist

fullclean: clean
	rm -rf ./node_modules
	rm -f lib/dot-grammar.js lib/version.js

node_modules: package.json
	$(NPM) install
	touch node_modules
