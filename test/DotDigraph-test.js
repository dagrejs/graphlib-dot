var DotDigraph = require("..").DotDigraph,
    Digraph = require("graphlib").Digraph;

describe("DotDigraph", function() {
  require("./abstract-dotify-test.js")("DotDigraph", DotDigraph, "Digraph", Digraph);
});
