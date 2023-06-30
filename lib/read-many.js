var grammar = require("./dot-grammar");
var buildGraph = require("./build-graph");

module.exports = function readMany(str) {
  var parseTree = grammar.parse(str);
  return parseTree.map(buildGraph);
};
