/* global chai, graphlibDot */

// These are smoke tests to make sure the bundles look like they are working
// correctly.

var expect = chai.expect;
var graphlib = graphlibDot.graphlib;

describe("bundle", function() {
  it("exports graphlibDot", function() {
    expect(graphlibDot).to.be.an("object");
    ["read", "readMany", "write"].forEach(function(fn) {
      expect(graphlibDot[fn]).to.be.a("function");
    });
    expect(graphlibDot.graphlib).to.be.an("object");
    expect(graphlibDot.version).to.be.a("string");
  });

  it("can serialize to DOT and back", function() {
    var g = new graphlib.Graph();
    g.setNode("a", { label: "a" });
    g.setNode("b", { label: "b" });
    g.setEdge("a", "b", { label: "ab" });

    var dot = graphlibDot.write(g);
    var g2 = graphlibDot.read(dot);

    expect(g2.node("a")).eqls({ label: "a" });
    expect(g2.node("b")).eqls({ label: "b" });
    expect(g2.edge("a", "b")).eqls({ label: "ab" });
  });
});
