var _ = require("./lodash");
var grammar = require("./dot-grammar");
var buildGraph = require("./build-graph");

module.exports = function readMany(str) {
  var parseTree = grammar.parse(str);
  return _.map(parseTree, buildGraph);
};
