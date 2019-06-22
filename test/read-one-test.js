var _ = require("lodash");
var expect = require("./chai").expect;
var read = require("..").read;

describe("read", function() {
  describe("graph", function() {
    it("can read an empty digraph", function() {
      var g = read("digraph {}");
      expect(g.nodeCount()).to.equal(0);
      expect(g.edgeCount()).to.equal(0);
      expect(g.graph()).to.eql({});
      expect(g.isDirected()).to.be.true;
      expect(g.isMultigraph()).to.be.true;
    });

    it("can read an empty graph", function() {
      var g = read("graph {}");
      expect(g.nodeCount()).to.equal(0);
      expect(g.edgeCount()).to.equal(0);
      expect(g.graph()).to.eql({});
      expect(g.isDirected()).to.be.false;
      expect(g.isMultigraph()).to.be.true;
    });

    it("can read a strict graph", function() {
      var g = read("strict digraph {}");
      expect(g.isMultigraph()).to.be.false;
    });

    it("can handle leading and trailing whitespace", function() {
      var g = read(" digraph {} ");
      expect(g.nodeCount()).to.equal(0);
      expect(g.edgeCount()).to.equal(0);
      expect(g.graph()).to.eql({});
      expect(g.isDirected()).to.be.true;
    });

    it("safely incorporates the id for the graph", function() {
      var g = read("digraph foobar {}");
      expect(g.nodeCount()).to.equal(0);
      expect(g.edgeCount()).to.equal(0);
      expect(g.graph()).to.eql({id: "foobar"});
      expect(g.isDirected()).to.be.true;
    });

    it("can read graph attributes", function() {
      var g = read("digraph { foo = bar; }");
      expect(g.graph()).eql({ foo: "bar" });
    });

    it("can handle various forms of whitespace", function() {
      var g = read("digraph {\tfoo\r=bar\n; }");
      expect(g.graph()).to.eql({ foo: "bar" });
    });
  });

  describe("comments", function() {
    it("ignores single-line comments", function() {
      var g = read("digraph { a //comment\n }");
      expect(g.hasNode("a")).to.be.true;
    });

    it("ignores multi-line comments", function() {
      var g = read("digraph { a /*comment*/\n }");
      expect(g.hasNode("a")).to.be.true;
    });
  });

  describe("nodes", function() {
    it("can read a single node graph", function() {
      var g = read("digraph { a }");
      expect(g.nodeCount()).to.equal(1);
      expect(g.hasNode("a")).to.be.true;
      expect(g.edgeCount()).to.equal(0);
    });

    it("can read a node with an attribute", function() {
      var g = read("digraph { a [label=foo]; }");
      expect(g.node("a")).to.eql({ label: "foo" });
    });

    it("can read a node with a quoted attribute", function() {
      var g = read("digraph { a [label=\"foo and bar\"]; }");
      expect(g.node("a")).to.eql({ label: "foo and bar" });
    });

    it("can read a node with comma-separated attributes", function() {
      var g = read("digraph { a [label=l, foo=f, bar=b]; }");
      expect(g.node("a")).to.eql({ label: "l", foo: "f", bar: "b" });
    });

    it("can read a node with space-separated attributes", function() {
      var g = read("digraph { a [label=l foo=f bar=b]; }");
      expect(g.node("a")).to.eql({ label: "l", foo: "f", bar: "b" });
    });

    it("can read a node with multiple attr defs", function() {
      var g = read("digraph { a [label=l] [foo=1] [foo=2]; }");
      expect(g.node("a")).to.eql({ label: "l", foo: "2" });
    });

    it("can read nodes with numeric ids", function() {
      var list = ["12", "-12", "12.34", "-12.34", ".34", "-.34", "12.", "-12."];
      var g = read("digraph { " + list.join(";") + " }");
      expect(_.sortBy(g.nodes())).to.eql(_.sortBy(list));
    });

    it("can read escaped quotes", function() {
      expect(read("digraph { \"\\\"a\\\"\" }").nodes()).to.eql(["\"a\""]);
    });

    it("preserves non-quote escapes", function() {
      expect(read("digraph { \"foo\\-bar\" }").nodes()).to.eql(["foo\\-bar"]);
    });

    it("can read quoted unicode", function() {
      var g = read("digraph { \"♖♘♗♕♔♗♘♖\" }");
      expect(g.nodes()).to.eql(["♖♘♗♕♔♗♘♖"]);
    });

    it("fails to read unquoted unicode", function() {
      expect(function() { read("digraph { ♖♘♗♕♔♗♘♖ }"); }).to.throw();
    });

    it("treats a number id followed by a letter as two nodes", function() {
      // Yes this is what the language specifies!
      var g = read("digraph { 123a }");
      expect(_.sortBy(g.nodes())).to.eql(["123", "a"]);
    });

    it("ignores node ports", function() {
      var g = read("digraph { a:port }");
      expect(g.node("a")).to.eql({});
    });

    var compass = ["n", "ne", "e", "se", "s", "sw", "w", "nw", "c", "_"];
    it("ignores node compass", function() {
      _.each(compass, function(c) {
        expect(read("digraph { a:" + c + " }").node("a")).to.eql({});
        expect(read("digraph { a : " + c + " }").node("a")).to.eql({});
      });
    });

    it("ignores node port compass", function() {
      _.each(compass, function(c) {
        expect(read("digraph { a:port:" + c + " }").node("a")).to.eql({});
        expect(read("digraph { a : port : " + c + " }").node("a")).to.eql({});
      });
    });
  });

  describe("edges", function() {
    it("can read an unlabelled undirected edge", function() {
      var g = read("strict graph { a -- b }");
      expect(g.edgeCount()).to.equal(1);
      expect(g.edge("a", "b")).to.eql({});
    });

    it("fails if reading an undirected edge in a directed graph", function() {
      expect(function() { read("graph { a -> b }"); }).to.throw();
    });

    it("can read an unlabelled directed edge", function() {
      var g = read("strict digraph { a -> b }");
      expect(g.edgeCount()).to.equal(1);
      expect(g.edge("a", "b")).to.eql({});
    });

    it("fails if reading a directed edge in an undirected graph", function() {
      expect(function() { read("digraph { a -- b }"); }).to.throw();
    });

    it("can read an edge with attributes", function() {
      var g = read("strict digraph { a -> b [label=foo]; }");
      expect(g.edge("a", "b")).to.eql({ label: "foo" });
    });

    it("can assign attributes to a path of nodes", function() {
      var g = read("strict digraph { a -> b -> c [label=foo]; }");
      expect(g.edge("a", "b")).to.eql({ label: "foo" });
      expect(g.edge("b", "c")).to.eql({ label: "foo" });
      expect(g.edgeCount()).to.equal(2);
    });

    it("assigns multiple labels if an edge is defined multiple times", function() {
      var g = read("digraph { a -> b [x=1 z=3]; a -> b [y=2 z=4] }");
      var results = _.map(g.nodeEdges("a", "b"), function(edge) {
        return g.edge(edge);
      });
      expect(_.sortBy(results, "z")).to.eql([
        { x: "1", z: "3" },
        { y: "2", z: "4" }
      ]);
      expect(g.edgeCount()).to.equal(2);
    });

    it("updates an edge if it is defined multiple times in strict mode", function() {
      var g = read("strict digraph { a -> b [x=1 z=3]; a -> b [y=2 z=4] }");
      expect(g.edge("a", "b")).to.eql({ x: "1", y: "2", z: "4" });
      expect(g.edgeCount()).to.equal(1);
    });
  });

  describe("subgraphs", function() {
    it("ignores empty subgraphs", function() {
      expect(read("digraph { subgraph X {} }").nodes()).to.be.empty;
      expect(read("digraph { subgraph {} }").nodes()).to.be.empty;
      expect(read("digraph { {} }").nodes()).to.be.empty;
    });

    it("reads nodes in a subgraph", function() {
      var g = read("digraph { subgraph X { a; b }; c }");
      expect(_.sortBy(g.nodes())).to.eql(["X", "a", "b", "c"]);
      expect(_.sortBy(g.children())).to.eql(["X", "c"]);
      expect(_.sortBy(g.children("X"))).to.eql(["a", "b"]);
    });

    it("assigns a node to the first subgraph in which it appears", function() {
      var g = read("digraph { subgraph X { a }; subgraph Y { a; b } }");
      expect(g.parent("a")).to.equal("X");
      expect(g.parent("b")).to.equal("Y");
    });

    it("reads edges in a subgraph", function() {
      var g = read("strict digraph { subgraph X { a; b; a -> b } }");
      expect(_.sortBy(g.nodes())).to.eql(["X", "a", "b"]);
      expect(_.sortBy(g.children("X"))).to.eql(["a", "b"]);
      expect(g.edge("a", "b")).to.eql({});
      expect(g.edgeCount()).to.equal(1);
    });

    it("assigns graph attributes to the subgraph in which they appear", function() {
      var g = read("strict digraph { subgraph X { foo=bar; a } }");
      expect(g.graph()).to.eql({});
      expect(g.node("X")).to.eql({ foo: "bar" });
    });

    it("reads anonymous subgraphs #1", function() {
      var g = read("digraph { subgraph { a } }");
      expect(g.parent("a")).to.not.be.undefined;
      expect(g.parent(g.parent("a"))).to.be.undefined;
    });

    it("reads anonymous subgraphs #2", function() {
      var g = read("digraph { { a } }");
      expect(g.parent("a")).to.not.be.undefined;
      expect(g.parent(g.parent("a"))).to.be.undefined;
    });

    it("reads subgraphs as the LHS of an edge statement", function() {
      var g = read("digraph { {a; b} -> c }");
      expect(g.hasEdge("a", "c")).to.be.true;
      expect(g.hasEdge("b", "c")).to.be.true;
      expect(g.edgeCount()).to.equal(2);
    });

    it("reads subgraphs as the RHS of an edge statement", function() {
      var g = read("digraph { a -> { b; c } }");
      expect(g.hasEdge("a", "b")).to.be.true;
      expect(g.hasEdge("a", "c")).to.be.true;
      expect(g.edgeCount()).to.equal(2);
    });

    it("handles subgraphs with edges as an LHS of another edge statment", function() {
      var g = read("digraph { {a -> b} -> c }");
      expect(g.hasEdge("a", "b")).to.be.true;
      expect(g.hasEdge("a", "c")).to.be.true;
      expect(g.hasEdge("b", "c")).to.be.true;
      expect(g.edgeCount()).to.equal(3);
    });

    it("reads subgraphs as both the LHS and RHS side of an edge statement", function() {
      var g = read("digraph { { a; b } -> { c; d } }");
      expect(g.hasEdge("a", "c")).to.be.true;
      expect(g.hasEdge("a", "d")).to.be.true;
      expect(g.hasEdge("b", "c")).to.be.true;
      expect(g.hasEdge("b", "d")).to.be.true;
      expect(g.edgeCount()).to.equal(4);
    });

    it("applies edges attributes when using subgraphs as LHS or RHS", function() {
      var g = read("strict digraph { { a; b } -> { c; d } [foo=bar] }");
      expect(g.edge("a", "c")).to.eql({ foo: "bar" });
      expect(g.edge("a", "d")).to.eql({ foo: "bar" });
      expect(g.edge("b", "c")).to.eql({ foo: "bar" });
      expect(g.edge("b", "d")).to.eql({ foo: "bar" });
      expect(g.edgeCount()).to.equal(4);
    });
  });

  describe("defaults", function() {
    it("adds default attributes to nodes", function() {
      var g = read("digraph { node [color=black]; a [label=foo]; b [label=bar] }");
      expect(g.node("a")).to.eql({ color: "black", label: "foo" });
      expect(g.node("b")).to.eql({ color: "black", label: "bar" });
    });

    it("can apply multiple node defaults", function() {
      var g = read("digraph { node[color=black]; node[shape=box]; a [label=foo] }");
      expect(g.node("a")).to.eql({ color: "black", shape: "box", label: "foo" });
    });

    it("only applies defaults already visited", function() {
      var g = read("digraph { node[color=black]; a; node[shape=box]; b; }");
      expect(g.node("a")).to.eql({ color: "black" });
      expect(g.node("b")).to.eql({ color: "black", shape: "box" });
    });

    it("only applies defaults to nodes created in the subgraph", function() {
      var g = read("digraph { a; { node[color=black]; a; b; } }");
      expect(g.node("a")).to.eql({});
      expect(g.node("b")).to.eql({ color: "black" });
    });

    it("allows defaults to redefined", function() {
      var g = read("digraph { node[color=black]; a; node[color=green]; b; }");
      expect(g.node("a")).to.eql({ color: "black" });
      expect(g.node("b")).to.eql({ color: "green" });
    });

    it("applies defaults to nodes created through an edge statement", function() {
      var g = read("digraph { node[color=black]; a -> b; }");
      expect(g.node("a")).to.eql({ color: "black" });
      expect(g.node("b")).to.eql({ color: "black" });
    });

    it("applies defaults to subgraphs", function() {
      var g = read("digraph { node[color=black]; { a; { b; c[color=green]; } } }");
      expect(g.node("a")).to.eql({ color: "black" });
      expect(g.node("b")).to.eql({ color: "black" });
      expect(g.node("c")).to.eql({ color: "green" });
    });

    it("applies defaults to edges", function() {
      var g = read("strict digraph { edge[color=black]; a -> b }");
      expect(g.node("a")).to.eql({});
      expect(g.node("b")).to.eql({});
      expect(g.edge("a", "b")).to.eql({ color: "black" });
    });
  });

  describe("failure cases", function() {
    it("fails if the graph block is not closed", function() {
      expect(function() { read("digraph {"); }).to.throw();
    });

    it("fails if an attribute block is not closed", function() {
      expect(function() { read("digraph { a [k=v}"); }).to.throw();
    });

    it("fails if an attribute is missing a key", function() {
      expect(function() { read("digraph { a [=v] }"); }).to.throw();
    });

    it("fails if an attribute is missing a value", function() {
      expect(function() { read("digraph { a [k=] }"); }).to.throw();
    });

    it("fails if an edge is missing an LHS", function() {
      expect(function() { read("digraph { -> b }"); }).to.throw();
    });

    it("fails if an edge is missing an RHS", function() {
      expect(function() { read("digraph { a -> }"); }).to.throw();
    });

    it("fails if a subgraph is left unclosed", function() {
      expect(function() { read("digraph { { a "); }).to.throw();
    });

    it("fails if a new subgraph is opened after a previous one", function() {
      expect(function() { read("digraph {} digraph {}"); }).to.throw();
    });
  });
});
