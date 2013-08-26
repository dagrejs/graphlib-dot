NODE?=node
NPM?=npm
BROWSERIFY?=$(NODE_MODULES)/browserify/bin/cmd.js
PEGJS?=$(NODE_MODULES)/pegjs/bin/pegjs
MOCHA?=$(NODE_MODULES)/mocha/bin/mocha
MOCHA_OPTS?=
JS_COMPILER=$(NODE_MODULES)/uglify-js/bin/uglifyjs
JS_COMPILER_OPTS?=--no-seqs
DOCGEN=$(NODE_MODULES)/dox-foundation/bin/dox-foundation

MODULE=graphlib-dot
MODULE_JS=$(MODULE).js
MODULE_MIN_JS=$(MODULE).min.js

DOC?=doc
NODE_MODULES=node_modules

# There does not appear to be an easy way to define recursive expansion, so
# we do our own expansion a few levels deep.
JS_SRC:=$(wildcard lib/*.js lib/*/*.js lib/*/*/*.js)
JS_TEST:=$(wildcard test/*.js test/*/*.js test/*/*/*.js)

BENCH_FILES?=$(wildcard bench/graphs/*)

all: $(MODULE_JS) $(MODULE_MIN_JS) $(DOC) test

$(MODULE_JS): Makefile browser.js $(NODE_MODULES) lib/dot-grammar.js lib/version.js $(JS_SRC)
	@rm -f $@
	$(NODE) $(BROWSERIFY) browser.js > $@
	@chmod a-w $@

$(MODULE_MIN_JS): $(MODULE_JS)
	@rm -f $@
	$(NODE) $(JS_COMPILER) $(JS_COMPILER_OPTS) $< > $@
	@chmod a-w $@

lib/version.js: src/version.js package.json
	$(NODE) src/version.js > $@

lib/dot-grammar.js: src/dot-grammar.pegjs $(NODE_MODULES)
	$(NODE) $(PEGJS) -e 'module.exports' src/dot-grammar.pegjs $@

$(NODE_MODULES): package.json
	$(NPM) install

$(DOC): lib/parse.js lib/write.js
	@rm -rf $@
	$(NODE) $(DOCGEN) --source lib/parse.js,lib/write.js --target $@

.PHONY: test
test: $(MODULE_JS) $(JS_TEST)
	$(NODE) $(MOCHA) $(MOCHA_OPTS) $(JS_TEST)

clean:
	rm -f $(MODULE_JS) $(MODULE_MIN_JS)
	rm -rf $(DOC)

fullclean: clean
	rm -rf $(NODE_MODULES)
