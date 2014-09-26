#!/usr/bin/env node

// Renders the bower.json template and prints it to stdout

var template = {
  name: 'graphlib-dot',
  version: require('../../package.json').version,
  main: ['js/graphlib-dot.js', 'js/graphlib-dot.min.js'],
  ignore: [
    'README.md'
  ],
  dependencies: {
  }
};

console.log(JSON.stringify(template, null, 2));
