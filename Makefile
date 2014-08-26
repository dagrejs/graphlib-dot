MOD = graphlib-dot

NPM = npm
BROWSERIFY = ./node_modules/browserify/bin/cmd.js
ISTANBUL = ./node_modules/istanbul/lib/cli.js
JSHINT = ./node_modules/jshint/bin/jshint
JSCS = ./node_modules/jscs/bin/jscs
MOCHA = ./node_modules/mocha/bin/_mocha
PEGJS = ./node_modules/pegjs/bin/pegjs
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs

ISTANBUL_OPTS = --dir $(COVERAGE_DIR) --report html
JSHINT_OPTS = --reporter node_modules/jshint-stylish/stylish.js
MOCHA_OPTS = -R dot

BUILD_DIR = build
COVERAGE_DIR = $(BUILD_DIR)/cov
DIRS = $(BUILD_DIR) $(COVERAGE_DIR)

SRC_FILES = index.js lib/dot-grammar.js lib/version.js $(shell find lib -type f -name '*.js')
TEST_FILES = $(shell find test -type f -name '*.js')
BUILD_FILES = $(addprefix $(BUILD_DIR)/, $(MOD).js $(MOD).min.js)

.PHONY: = all clean dist

all: $(BUILD_FILES)

lib/dot-grammar.js: src/dot-grammar.pegjs
	$(PEGJS) --allowed-start-rules "start,graphStmt" -e 'module.exports' $< $@

lib/version.js: package.json
	@src/version.js > $@

$(DIRS):
	@mkdir -p $@

$(BUILD_DIR)/$(MOD).js: browser.js $(SRC_FILES) $(TEST_FILES) node_modules | $(BUILD_DIR)
	@echo Building...
	@$(ISTANBUL) cover $(ISTANBUL_OPTS) $(MOCHA) --dir $(COVERAGE_DIR) -- $(MOCHA_OPTS) $(TEST_FILES) || $(MOCHA) $(MOCHA_OPTS) $(TEST_FILES)
	@$(JSHINT) $(JSHINT_OPTS) $(filter-out node_modules lib/dot-grammar.js, $?)
	@$(JSCS) $(filter-out node_modules lib/dot-grammar.js, $?)
	@$(BROWSERIFY) -x lodash -x graphlib $< > $@

$(BUILD_DIR)/$(MOD).min.js: $(BUILD_DIR)/$(MOD).js
	@$(UGLIFY) $< --comments '@license' > $@


clean:
	rm -rf build dist

fullclean: clean
	rm -rf ./node_modules
	rm -f lib/dot-grammar.js lib/version.js

node_modules: package.json
	@$(NPM) install
	@touch node_modules
