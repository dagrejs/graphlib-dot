var _ = require("lodash"),
    expect = require("./chai").expect,
    Digraph = require("graphlib").Digraph,
    CDigraph = require("graphlib").CDigraph,
    Graph = require("graphlib").Graph,
    read = require("..").read,
    write = require("..").write;

describe("write", function() {
  it("can write an empty digraph", function() {
    var str = write(new Digraph());
    var g = read(str);
    expect(g.nodeCount()).to.equal(0);
    expect(g.edgeCount()).to.equal(0);
    expect(g.getGraph()).to.eql({});
    expect(g.isDirected()).to.be.true;
  });

  it("can write an empty graph", function() {
    var str = write(new Graph());
    var g = read(str);
    expect(g.nodeCount()).to.equal(0);
    expect(g.edgeCount()).to.equal(0);
    expect(g.getGraph()).to.eql({});
    expect(g.isDirected()).to.be.false;
  });

  it("can write a graph label with an object", function() {
    var g = new Digraph();
    g.setGraph({ foo: "bar" });
    var str = write(g);
    var g2 = read(str);
    expect(g2.getGraph()).to.eql({ foo: "bar" });
  });

  it("can write a node", function() {
    var g = new Digraph();
    g.setNode("n1");
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("n1")).to.be.true;
    expect(g2.getNode("n1")).to.eql({});
    expect(g2.nodeCount()).to.equal(1);
    expect(g2.edgeCount()).to.equal(0);
  });

  it("can write a node with attributes", function() {
    var g = new Digraph();
    g.setNode("n1", { foo: "bar" });
    var str = write(g);
    var g2 = read(str);
    expect(g2.getNode("n1")).to.eql({ foo: "bar" });
    expect(g2.nodeCount()).to.equal(1);
    expect(g2.edgeCount()).to.equal(0);
  });

  it("can write an edge", function() {
    var g = new Digraph();
    g.setEdge("n1", "n2");
    var str = write(g, { strict: true });
    var g2 = read(str);
    expect(g2.hasEdge("n1", "n2")).to.be.true;
    expect(g2.getEdge("n1", "n2")).to.eql({});
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(1);
  });

  it("can write an edge with attributes", function() {
    var g = new Digraph();
    g.setEdge("n1", "n2", { foo: "bar" });
    var str = write(g, { strict: true });
    var g2 = read(str);
    expect(g2.getEdge("n1", "n2")).to.eql({ foo: "bar" });
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(1);
  });

  it("can write multi-edges", function() {
    var g = new Digraph();
    g.setEdge("n1", "n2", [{ foo: "bar" }, { foo: "baz" }]);
    var str = write(g);
    var g2 = read(str);
    expect(_.sortBy(g2.getEdge("n1", "n2"), "foo")).to.eql([
      { foo: "bar" },
      { foo: "baz" }
    ]);
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(1);
  });

  it("can write ids that must be escaped", function() {
    var g = new Digraph();
    g.setNode("\"n1\"");
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("\"n1\"")).to.be.true;
    expect(g2.getNode("\"n1\"")).to.eql({});
    expect(g2.nodeCount()).to.equal(1);
    expect(g2.edgeCount()).to.equal(0);
  });

  it("can write subgraphs", function() {
    var g = new CDigraph();
    g.setParent("n1", "root");
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("n1")).to.be.true;
    expect(g2.hasNode("root")).to.be.true;
    expect(g2.getParent("n1")).to.equal("root");
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(0);
  });

  it("can write subgraphs with attributes", function() {
    var g = new CDigraph();
    g.setParent("n1", "root");
    g.setNode("root", { foo: "bar" });
    var str = write(g);
    var g2 = read(str);
    expect(g2.hasNode("n1")).to.be.true;
    expect(g2.hasNode("root")).to.be.true;
    expect(g2.getNode("root")).to.eql({ foo: "bar" });
    expect(g2.getParent("n1")).to.equal("root");
    expect(g2.nodeCount()).to.equal(2);
    expect(g2.edgeCount()).to.equal(0);
  });
});
