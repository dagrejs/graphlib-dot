var expect = require("./chai").expect;
var read = require("..").read;

describe("read", () => {
  describe("graph", () => {
    it("can read an empty digraph", () => {
      var g = read("digraph {}");
      expect(g.nodeCount()).to.equal(0);
      expect(g.edgeCount()).to.equal(0);
      expect(g.graph()).to.eql({});
      expect(g.isDirected()).to.be.true;
      expect(g.isMultigraph()).to.be.true;
    });

    it("can read an empty graph", () => {
      var g = read("graph {}");
      expect(g.nodeCount()).to.equal(0);
      expect(g.edgeCount()).to.equal(0);
      expect(g.graph()).to.eql({});
      expect(g.isDirected()).to.be.false;
      expect(g.isMultigraph()).to.be.true;
    });

    it("can read a strict graph", () => {
      var g = read("strict digraph {}");
      expect(g.isMultigraph()).to.be.false;
    });

    it("can handle leading and trailing whitespace", () => {
      var g = read(" digraph {} ");
      expect(g.nodeCount()).to.equal(0);
      expect(g.edgeCount()).to.equal(0);
      expect(g.graph()).to.eql({});
      expect(g.isDirected()).to.be.true;
    });

    it("safely incorporates the id for the graph", () => {
      var g = read("digraph foobar {}");
      expect(g.nodeCount()).to.equal(0);
      expect(g.edgeCount()).to.equal(0);
      expect(g.graph()).to.eql({id: "foobar"});
      expect(g.isDirected()).to.be.true;
    });

    it("can read graph attributes", () => {
      var g = read("digraph { foo = bar; }");
      expect(g.graph()).eql({ foo: "bar" });
    });

    it("can handle various forms of whitespace", () => {
      var g = read("digraph {\tfoo\r=bar\n; }");
      expect(g.graph()).to.eql({ foo: "bar" });
    });
  });

  describe("comments", () => {
    it("ignores single-line comments", () => {
      var g = read("digraph { a //comment\n }");
      expect(g.hasNode("a")).to.be.true;
    });

    it("ignores multi-line comments", () => {
      var g = read("digraph { a /*comment*/\n }");
      expect(g.hasNode("a")).to.be.true;
    });
  });

  describe("nodes", () => {
    it("can read a single node graph", () => {
      var g = read("digraph { a }");
      expect(g.nodeCount()).to.equal(1);
      expect(g.hasNode("a")).to.be.true;
      expect(g.edgeCount()).to.equal(0);
    });

    it("can read a node with an attribute", () => {
      var g = read("digraph { a [label=foo]; }");
      expect(g.node("a")).to.eql({ label: "foo" });
    });

    it("can read a node with a quoted attribute", () => {
      var g = read("digraph { a [label=\"foo and bar\"]; }");
      expect(g.node("a")).to.eql({ label: "foo and bar" });
    });

    it("can read a node with comma-separated attributes", () => {
      var g = read("digraph { a [label=l, foo=f, bar=b]; }");
      expect(g.node("a")).to.eql({ label: "l", foo: "f", bar: "b" });
    });

    it("can read a node with space-separated attributes", () => {
      var g = read("digraph { a [label=l foo=f bar=b]; }");
      expect(g.node("a")).to.eql({ label: "l", foo: "f", bar: "b" });
    });

    it("can read a node with multiple attr defs", () => {
      var g = read("digraph { a [label=l] [foo=1] [foo=2]; }");
      expect(g.node("a")).to.eql({ label: "l", foo: "2" });
    });

    it("can read nodes with numeric ids", () => {
      var list = ["12", "-12", "12.34", "-12.34", ".34", "-.34", "12.", "-12."];
      var g = read("digraph { " + list.join(";") + " }");
      expect(g.nodes().sort()).to.eql(list.sort());
    });

    it("can read escaped quotes", () => {
      expect(read("digraph { \"\\\"a\\\"\" }").nodes()).to.eql(["\"a\""]);
    });

    it("preserves non-quote escapes", () => {
      expect(read("digraph { \"foo\\-bar\" }").nodes()).to.eql(["foo\\-bar"]);
    });

    it("can read quoted unicode", () => {
      var g = read("digraph { \"♖♘♗♕♔♗♘♖\" }");
      expect(g.nodes()).to.eql(["♖♘♗♕♔♗♘♖"]);
    });

    it("fails to read unquoted unicode", () => {
      expect(() => read("digraph { ♖♘♗♕♔♗♘♖ }")).to.throw();
    });

    it("treats a number id followed by a letter as two nodes", () => {
      // Yes this is what the language specifies!
      var g = read("digraph { 123a }");
      expect(g.nodes().sort()).to.eql(["123", "a"]);
    });

    it("ignores node ports", () => {
      var g = read("digraph { a:port }");
      expect(g.node("a")).to.eql({});
    });

    var compass = ["n", "ne", "e", "se", "s", "sw", "w", "nw", "c", "_"];
    it("ignores node compass", () => {
      compass.forEach(c => {
        expect(read("digraph { a:" + c + " }").node("a")).to.eql({});
        expect(read("digraph { a : " + c + " }").node("a")).to.eql({});
      });
    });

    it("ignores node port compass", () => {
      compass.forEach(c => {
        expect(read("digraph { a:port:" + c + " }").node("a")).to.eql({});
        expect(read("digraph { a : port : " + c + " }").node("a")).to.eql({});
      });
    });
  });

  describe("edges", () => {
    it("can read an unlabelled undirected edge", () => {
      var g = read("strict graph { a -- b }");
      expect(g.edgeCount()).to.equal(1);
      expect(g.edge("a", "b")).to.eql({});
    });

    it("fails if reading an undirected edge in a directed graph", () => {
      expect(() => read("graph { a -> b }")).to.throw();
    });

    it("can read an unlabelled directed edge", () => {
      var g = read("strict digraph { a -> b }");
      expect(g.edgeCount()).to.equal(1);
      expect(g.edge("a", "b")).to.eql({});
    });

    it("fails if reading a directed edge in an undirected graph", () => {
      expect(() => read("digraph { a -- b }")).to.throw();
    });

    it("can read an edge with attributes", () => {
      var g = read("strict digraph { a -> b [label=foo]; }");
      expect(g.edge("a", "b")).to.eql({ label: "foo" });
    });

    it("can assign attributes to a path of nodes", () => {
      var g = read("strict digraph { a -> b -> c [label=foo]; }");
      expect(g.edge("a", "b")).to.eql({ label: "foo" });
      expect(g.edge("b", "c")).to.eql({ label: "foo" });
      expect(g.edgeCount()).to.equal(2);
    });

    it("assigns multiple labels if an edge is defined multiple times", () => {
      var g = read("digraph { a -> b [x=1 z=3]; a -> b [y=2 z=4] }");
      var results = g.nodeEdges("a", "b").map(edge => {
        return g.edge(edge);
      });
      expect(results.sort((a, b) => a.z - b.z)).to.eql([
        { x: "1", z: "3" },
        { y: "2", z: "4" }
      ]);
      expect(g.edgeCount()).to.equal(2);
    });

    it("updates an edge if it is defined multiple times in strict mode", () => {
      var g = read("strict digraph { a -> b [x=1 z=3]; a -> b [y=2 z=4] }");
      expect(g.edge("a", "b")).to.eql({ x: "1", y: "2", z: "4" });
      expect(g.edgeCount()).to.equal(1);
    });
  });

  describe("subgraphs", () => {
    it("ignores empty subgraphs", () => {
      expect(read("digraph { subgraph X {} }").nodes()).to.be.empty;
      expect(read("digraph { subgraph {} }").nodes()).to.be.empty;
      expect(read("digraph { {} }").nodes()).to.be.empty;
    });

    it("reads nodes in a subgraph", () => {
      var g = read("digraph { subgraph X { a; b }; c }");
      expect(g.nodes().sort()).to.eql(["X", "a", "b", "c"]);
      expect(g.children().sort()).to.eql(["X", "c"]);
      expect(g.children("X").sort()).to.eql(["a", "b"]);
    });

    it("assigns a node to the first subgraph in which it appears", () => {
      var g = read("digraph { subgraph X { a }; subgraph Y { a; b } }");
      expect(g.parent("a")).to.equal("X");
      expect(g.parent("b")).to.equal("Y");
    });

    it("reads edges in a subgraph", () => {
      var g = read("strict digraph { subgraph X { a; b; a -> b } }");
      expect(g.nodes().sort()).to.eql(["X", "a", "b"]);
      expect(g.children("X").sort()).to.eql(["a", "b"]);
      expect(g.edge("a", "b")).to.eql({});
      expect(g.edgeCount()).to.equal(1);
    });

    it("assigns graph attributes to the subgraph in which they appear", () => {
      var g = read("strict digraph { subgraph X { foo=bar; a } }");
      expect(g.graph()).to.eql({});
      expect(g.node("X")).to.eql({ foo: "bar" });
    });

    it("reads anonymous subgraphs #1", () => {
      var g = read("digraph { subgraph { a } }");
      expect(g.parent("a")).to.not.be.undefined;
      expect(g.parent(g.parent("a"))).to.be.undefined;
    });

    it("reads anonymous subgraphs #2", () => {
      var g = read("digraph { { a } }");
      expect(g.parent("a")).to.not.be.undefined;
      expect(g.parent(g.parent("a"))).to.be.undefined;
    });

    it("reads subgraphs as the LHS of an edge statement", () => {
      var g = read("digraph { {a; b} -> c }");
      expect(g.hasEdge("a", "c")).to.be.true;
      expect(g.hasEdge("b", "c")).to.be.true;
      expect(g.edgeCount()).to.equal(2);
    });

    it("reads subgraphs as the RHS of an edge statement", () => {
      var g = read("digraph { a -> { b; c } }");
      expect(g.hasEdge("a", "b")).to.be.true;
      expect(g.hasEdge("a", "c")).to.be.true;
      expect(g.edgeCount()).to.equal(2);
    });

    it("handles subgraphs with edges as an LHS of another edge statment", () => {
      var g = read("digraph { {a -> b} -> c }");
      expect(g.hasEdge("a", "b")).to.be.true;
      expect(g.hasEdge("a", "c")).to.be.true;
      expect(g.hasEdge("b", "c")).to.be.true;
      expect(g.edgeCount()).to.equal(3);
    });

    it("reads subgraphs as both the LHS and RHS side of an edge statement", () => {
      var g = read("digraph { { a; b } -> { c; d } }");
      expect(g.hasEdge("a", "c")).to.be.true;
      expect(g.hasEdge("a", "d")).to.be.true;
      expect(g.hasEdge("b", "c")).to.be.true;
      expect(g.hasEdge("b", "d")).to.be.true;
      expect(g.edgeCount()).to.equal(4);
    });

    it("applies edges attributes when using subgraphs as LHS or RHS", () => {
      var g = read("strict digraph { { a; b } -> { c; d } [foo=bar] }");
      expect(g.edge("a", "c")).to.eql({ foo: "bar" });
      expect(g.edge("a", "d")).to.eql({ foo: "bar" });
      expect(g.edge("b", "c")).to.eql({ foo: "bar" });
      expect(g.edge("b", "d")).to.eql({ foo: "bar" });
      expect(g.edgeCount()).to.equal(4);
    });
  });

  describe("defaults", () => {
    it("adds default attributes to nodes", () => {
      var g = read("digraph { node [color=black]; a [label=foo]; b [label=bar] }");
      expect(g.node("a")).to.eql({ color: "black", label: "foo" });
      expect(g.node("b")).to.eql({ color: "black", label: "bar" });
    });

    it("can apply multiple node defaults", () => {
      var g = read("digraph { node[color=black]; node[shape=box]; a [label=foo] }");
      expect(g.node("a")).to.eql({ color: "black", shape: "box", label: "foo" });
    });

    it("only applies defaults already visited", () => {
      var g = read("digraph { node[color=black]; a; node[shape=box]; b; }");
      expect(g.node("a")).to.eql({ color: "black" });
      expect(g.node("b")).to.eql({ color: "black", shape: "box" });
    });

    it("only applies defaults to nodes created in the subgraph", () => {
      var g = read("digraph { a; { node[color=black]; a; b; } }");
      expect(g.node("a")).to.eql({});
      expect(g.node("b")).to.eql({ color: "black" });
    });

    it("allows defaults to redefined", () => {
      var g = read("digraph { node[color=black]; a; node[color=green]; b; }");
      expect(g.node("a")).to.eql({ color: "black" });
      expect(g.node("b")).to.eql({ color: "green" });
    });

    it("applies defaults to nodes created through an edge statement", () => {
      var g = read("digraph { node[color=black]; a -> b; }");
      expect(g.node("a")).to.eql({ color: "black" });
      expect(g.node("b")).to.eql({ color: "black" });
    });

    it("applies defaults to subgraphs", () => {
      var g = read("digraph { node[color=black]; { a; { b; c[color=green]; } } }");
      expect(g.node("a")).to.eql({ color: "black" });
      expect(g.node("b")).to.eql({ color: "black" });
      expect(g.node("c")).to.eql({ color: "green" });
    });

    it("applies defaults to edges", () => {
      var g = read("strict digraph { edge[color=black]; a -> b }");
      expect(g.node("a")).to.eql({});
      expect(g.node("b")).to.eql({});
      expect(g.edge("a", "b")).to.eql({ color: "black" });
    });
  });

  describe("failure cases", () => {
    it("fails if the graph block is not closed", () => {
      expect(() => read("digraph {")).to.throw();
    });

    it("fails if an attribute block is not closed", () => {
      expect(() => read("digraph { a [k=v}")).to.throw();
    });

    it("fails if an attribute is missing a key", () => {
      expect(() => read("digraph { a [=v] }")).to.throw();
    });

    it("fails if an attribute is missing a value", () => {
      expect(() => read("digraph { a [k=] }")).to.throw();
    });

    it("fails if an edge is missing an LHS", () => {
      expect(() => read("digraph { -> b }")).to.throw();
    });

    it("fails if an edge is missing an RHS", () => {
      expect(() => read("digraph { a -> }")).to.throw();
    });

    it("fails if a subgraph is left unclosed", () => {
      expect(() => read("digraph { { a ")).to.throw();
    });

    it("fails if a new subgraph is opened after a previous one", () => {
      expect(() => read("digraph {} digraph {}")).to.throw();
    });
  });
});
