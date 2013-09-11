var common = require("./common"),
    assert = common.assert;

module.exports = function(name, Constructor) {
  describe(name, function() {
    var g;

    beforeEach(function() {
      g = new Constructor();
    });

    describe("new " + name + "()", function() {
      it("has no nodes", function() {
        assert.equal(g.order(), 0);
        assert.lengthOf(g.nodes(), 0);
      });

      it("has no edges", function() {
        assert.equal(g.size(), 0);
        assert.lengthOf(g.edges(), 0);
      });

      it("has no subgraphs", function() {
        assert.lengthOf(g.subgraphs(), 0);
      });
    });

    describe("id collisions", function() {
      beforeEach(function() {
        g.addNode(1);
        g.addNode(2);
      });

      it("does not allow collisions for node ids with node, edge, subgraph ids", function() {
        assert.throws(function() { g.addNode(1); });
      });

      it("does not allow collisions for edge ids with node, edge, subgraph ids", function() {
        assert.throws(function() { g.addEdge(1, 1, 2); });
      });

      it("does not allow collisions for subgraph ids with node, edge, subgraph ids", function() {
        assert.throws(function() { g.addSubgraph(1); });
      });
    });

    describe("subgraph", function() {
      it("is an empty object when no initial value is assigned", function() {
        g.addSubgraph("sg1");
        assert.deepEqual(g.subgraph("sg1"), {});
      });

      it("returns the value assigned to the subgraph with 1 argument", function() {
        g.addSubgraph("sg1", {a: "a-value"});
        assert.deepEqual(g.subgraph("sg1"), {a: "a-value"});
      });

      it("assigns a value ot the subgraph with 2 arguments", function() {
        g.addSubgraph("sg1");
        g.subgraph("sg1", {a: "a-value"});
        assert.deepEqual(g.subgraph("sg1"), {a: "a-value"});
      });

      it("only allows objects as value", function() {
        g.addSubgraph("sg1");
        assert.throws(function() { g.subgraph("sg1", "string"); });
      });
    });

    describe("parent", function() {
      it("throws if the object is not in the graph", function() {
        assert.throws(function() { g.parent("node-1"); });
      });

      it("defaults to null (root) for new nodes", function() {
        g.addNode(1);
        assert.isNull(g.parent(1));
      });

      it("defaults to null (root) for new edges", function() {
        g.addNode(1);
        g.addEdge("A", 1, 1);
        assert.isNull(g.parent("A"));
      });

      it("defaults to null (root) for new subgraphs", function() {
        g.addSubgraph("subgraph1");
        assert.isNull(g.parent("subgraph1"));
      });

      it("throws an error for a null or undefined parameter", function() {
        assert.throws(function() { g.parent(); });
        assert.throws(function() { g.parent(null); });
      });

      it("sets the parent with 2 arguments", function() {
        g.addNode(1);
        g.addSubgraph("sg1");
        g.parent(1, "sg1");
        assert.equal(g.parent(1), "sg1");
        assert.lengthOf(g.children("sg1"), 1);
      });

      it("sets the parent to root if it is null", function() {
        g.addNode(1);
        g.addSubgraph("sg1");
        g.parent(1, "sg1");
        g.parent(1, null);
        assert.equal(g.parent(1), null);
        assert.lengthOf(g.children("sg1"), 0);
        assert.lengthOf(g.children(null), 2);
      });

      it("does not allow a subgraph to be its own parent", function() {
        g.addSubgraph("sg1");
        assert.throws(function() { g.parent("sg1", "sg1"); });
      });
    });

    describe("children", function() {
      it("returns an empty list for an empty subgraph", function() {
        g.addSubgraph("sg1");
        assert.deepEqual(g.children("sg1"), []);
      });

      it("returns a list of all nodes in the root graph with the null parameter", function() {
        g.addNode(1);
        g.addEdge(2, 1, 1);
        g.addSubgraph(3);
        assert.sameMembers(g.children(null).map(function(x) { return x.id; }),
                           [1, 2, 3]);
      });

      it("returns the type for a node", function() {
        g.addSubgraph("sg1");
        g.addNode(1);
        g.parent(1, "sg1");
        assert.deepEqual(g.children("sg1"), [{id: 1, type: "node"}]);
      });

      it("returns the type for an edge", function() {
        g.addSubgraph("sg1");
        g.addNode(1);
        g.addEdge("A", 1, 1);
        g.parent("A", "sg1");
        assert.deepEqual(g.children("sg1"), [{id: "A", type: "edge"}]);
      });

      it("returns the type for a subgraph", function() {
        g.addSubgraph("sg1");
        g.addSubgraph("sg2");
        g.parent("sg2", "sg1");
        assert.deepEqual(g.children("sg1"), [{id: "sg2", type: "subgraph"}]);
      });
    });

    describe("addNode", function() {
      it("defaults to an empty object for value", function() {
        g.addNode(1);
        assert.deepEqual(g.node(1), {});
      });

      it("only allows objects for value", function() {
        g.addNode(1, {});
        assert.throws(function() { g.addNode(2, "string"); });
      });
    });

    describe("node", function() {
      it("only allows objects for value", function() {
        g.addNode(1);
        assert.throws(function() { g.node(1, "string"); });
      });
    });

    describe("addEdge", function() {
      it("defaults to an empty object for value", function() {
        g.addNode(1);
        g.addEdge("A", 1, 1);
        assert.deepEqual(g.edge("A"), {});
      });

      it("only allows objects for value", function() {
        g.addNode(1);
        g.addEdge("A", 1, 1, {});
        assert.throws(function() { g.addEdge("B", 1, 1, "string"); });
      });
    });

    describe("edge", function() {
      it("only allows objects for value", function() {
        g.addNode(1);
        g.addEdge("A", 1, 1);
        assert.throws(function() { g.edge("A", "string"); });
      });
    });

    describe("addSubgraph", function() {
      it("adds a new subgraph to the graph", function() {
        var id = g.addSubgraph("subgraph1");
        assert.sameMembers(g.subgraphs(), ["subgraph1"]);
        assert.isTrue(g.hasSubgraph("subgraph1"));
        assert.equal(id, "subgraph1");
      });

      it("assigns the new subgraph to the root graph", function() {
        g.addSubgraph("subgraph1");
        assert.isNull(g.parent("subgraph1"));
      });

      it("creates a unique id if the id parameter is null", function() {
        var id = g.addSubgraph(null);
        assert.sameMembers(g.subgraphs(), [id]);
        assert.isTrue(g.hasSubgraph(id));
      });

      it("creates a unique id if the id parameter is undefined", function() {
        var id = g.addSubgraph();
        assert.sameMembers(g.subgraphs(), [id]);
        assert.isTrue(g.hasSubgraph(id));
      });
    });

    describe("delSubgraph", function() {
      it("removes an existing subgraph", function() {
        g.addSubgraph("sg1");
        g.delSubgraph("sg1");
        assert.sameMembers(g.subgraphs(), []);
        assert.isFalse(g.hasSubgraph("sg1"));
      });

      it("promotes children to the root when the subgraph was off the root", function() {
        g.addSubgraph("sg1");
        g.addNode(1);
        g.addEdge("A", 1, 1);
        g.parent(1, "sg1");
        g.parent("A", "sg1");
        g.delSubgraph("sg1");
        assert.equal(g.parent(1), null);
        assert.equal(g.parent("A"), null);
      });

      it("promotes children to the parent of the subgraph", function() {
        g.addSubgraph("sg1");
        g.addSubgraph("sg2");
        g.addNode(1);
        g.addEdge("A", 1, 1);
        g.parent("sg1", "sg2");
        g.parent(1, "sg1");
        g.parent("A", "sg1");
        g.delSubgraph("sg1");
        assert.equal(g.parent(1), "sg2");
        assert.equal(g.parent("A"), "sg2");
      });

      it("removes the parent information", function() {
        g.addSubgraph("sg1");
        g.delSubgraph("sg1");
        assert.throws(function() { g.parent("sg1"); });
      });

      it("removes the children information", function() {
        g.addSubgraph("sg1");
        g.delSubgraph("sg1");
        assert.throws(function() { g.children("sg1"); });
      });

      it("removes the value information", function() {
        g.addSubgraph("sg1", {a: "a-value"});
        g.delSubgraph("sg1");
        assert.throws(function() { g.subgraph("sg1"); });
      });

      it("throws an error for non-subgraphs", function() {
        g.addNode(1);
        assert.throws(function() { g.delSubgraph(1); });
      });
    });
  });
};
