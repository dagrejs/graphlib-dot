#!/usr/bin/env node

// Renders the bower.json template and prints it to stdout

var template = {
  name: "graphlib-dot",
  version: require("../../package.json").version,
  main: [ "dist/graphlib-dot.core.js", "dist/graphlib-dot.core.min.js" ],
  ignore: [
    ".*",
    "README.md",
    "CHANGELOG.md",
    "Makefile",
    "browser.js",
    "dist/graphlib-dot.js",
    "dist/graphlib-dot.min.js",
    "index.js",
    "karma*",
    "lib/**",
    "package.json",
    "src/**",
    "test/**"
  ],
  dependencies: {
    "lodash": "^2.4.1",
    "graphlib": "^0.9.1"
  }
};

console.log(JSON.stringify(template, null, 2));
