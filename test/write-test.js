var _ = require("lodash");
var expect = require("./chai").expect;
var Graph = require("graphlib").Graph;
var read = require("..").read;
var write = require("..").write;

describe("write", function() {
  it("can write an empty digraph", function() {
    var str = write(new Graph());
    var g = read(str);
    expect(g.nodeCount()).to.equal(0);
    expect(g.edgeCount()).to.equal(0);
    expect(g.graph()).to.eql({});
    expect(g.isDirected()).to.be.true;
  });

  it("can write an empty undirected graph", function() {
    var str = write(new Graph({ directed: false }));
    var g = read(str);
    expect(g.nodeCount()).to.equal(0);
    expect(g.edgeCount()).to.equal(0);
    expect(g.graph()).to.eql({});
    expect(g.isDirected()).to.be.false;
  });

  it("can write a graph label with an object", function() {
    var g = new Graph();
    g.setGraph({ foo: "bar" });
    var str = write(g);
    var g2 = read(str);
    expect(g2.graph()).to.eql({ foo: "bar" });
  });

  it("can write a node", function() {
    var g = new Graph();
    g.setNode("n1");
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("n1")).to.be.true;
    expect(g2.node("n1")).to.eql({});
    expect(g2.nodeCount()).to.equal(1);
    expect(g2.edgeCount()).to.equal(0);
  });

  it("can write a node with attributes", function() {
    var g = new Graph();
    g.setNode("n1", { foo: "bar" });
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("n1"));
    expect(g2.node("n1")).to.eql({ foo: "bar" });
    expect(g2.nodeCount()).to.equal(1);
    expect(g2.edgeCount()).to.equal(0);
  });

  it("can write an edge", function() {
    var g = new Graph();
    g.setEdge("n1", "n2");
    var str = write(g, { strict: true });
    var g2 = read(str);
    expect(g2.edge("n1", "n2")).to.eql({});
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(1);
  });

  it("can write an edge with attributes", function() {
    var g = new Graph();
    g.setEdge("n1", "n2", { foo: "bar" });
    var str = write(g, { strict: true });
    var g2 = read(str);
    expect(g2.edge("n1", "n2")).to.eql({ foo: "bar" });
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(1);
  });

  it("can write multi-edges", function() {
    var g = new Graph({ multigraph: true });
    g.setEdge("n1", "n2", { foo: "bar" });
    g.setEdge("n1", "n2", { foo: "baz" }, "another");
    var str = write(g);
    var g2 = read(str);
    expect(g2.nodeEdges("n1", "n2")).to.have.length(2);
    var edgeAttrs = _.map(g2.nodeEdges("n1", "n2"), function(edge) {
      return g2.edge(edge);
    });
    expect(_.sortBy(edgeAttrs)).to.eql([
      { foo: "bar" },
      { foo: "baz" }
    ]);
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(2);
  });

  it("preserves the strict (non-multigraph) state", function() {
    var g = new Graph();
    var str = write(g);
    var g2 = read(str);
    expect(g2.isMultigraph()).to.be.false;
  });

  it("can write ids that must be escaped", function() {
    var g = new Graph();
    g.setNode("\"n1\"");
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("\"n1\"")).to.be.true;
    expect(g2.node("\"n1\"")).to.eql({});
    expect(g2.nodeCount()).to.equal(1);
    expect(g2.edgeCount()).to.equal(0);
  });

  it("can write subgraphs", function() {
    var g = new Graph({ compound: true });
    g.setParent("n1", "root");
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("n1")).to.be.true;
    expect(g2.hasNode("root")).to.be.true;
    expect(g2.parent("n1")).to.equal("root");
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(0);
  });

  it("can write subgraphs with attributes", function() {
    var g = new Graph({ compound: true });
    g.setParent("n1", "root");
    g.setNode("root", { foo: "bar" });
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("n1")).to.be.true;
    expect(g2.hasNode("root")).to.be.true;
    expect(g2.node("root")).to.eql({ foo: "bar" });
    expect(g2.parent("n1")).to.equal("root");
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(0);
  });
});
