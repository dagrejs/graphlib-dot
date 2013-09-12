var DotGraph = require("..").DotGraph,
    Graph = require("graphlib").Graph;

describe("DotGraph", function() {
  require("./abstract-dotify-test.js")("DotGraph", DotGraph, "Graph", Graph);
});
