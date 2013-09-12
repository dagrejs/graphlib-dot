var common = require("./common"),
    assert = common.assert;

module.exports = function(name, Constructor, superName, SuperConstructor) {
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

    it("assigns a value to the subgraph with 2 arguments", function() {
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

    it("removes the current parent with 2 arguments", function() {
      g.addNode(1);
      g.addSubgraph("sg1");
      g.parent(1, "sg1");
      assert.deepEqual(g.children(null).map(function(x) { return x.id; }), ["sg1"]);
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

  describe("graph", function() {
    it("only allows objects for value", function() {
      assert.throws(function() { g.graph("string"); });
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

    it("returns the id used for the edge", function() {
      g.addNode(1);
      assert.equal(g.addEdge("A", 1, 1, {}), "A");
      assert.isDefined(g.addEdge(null, 1, 1, {}));
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

  describe("from" + superName, function() {
    var fromSuper = Constructor["from" + superName];

    it("returns a " + name, function() {
      var g = new SuperConstructor();
      assert.instanceOf(fromSuper(g), Constructor);
    });

    it("includes the graph value", function() {
      var g = new SuperConstructor();
      g.graph({a: "a-value"});
      assert.deepEqual(fromSuper(g).graph(), {a: "a-value"});
    });

    it("fails to convert a graph with a non-object value", function() {
      var g = new SuperConstructor();
      g.graph("foo");
      assert.throws(function() { fromSuper(g); });
    });

    it("includes nodes from the source graph", function() {
      var g = new SuperConstructor();
      g.addNode(1);
      g.addNode(2);
      assert.sameMembers(fromSuper(g).nodes(), [1, 2]);
    });

    it("includes node attributes from the source graph", function() {
      var g = new SuperConstructor();
      g.addNode(1, {a: "a-value"});
      assert.deepEqual(fromSuper(g).node(1), {a: "a-value"});
    });

    it("fails to convert a graph with non-object node values", function() {
      var g = new SuperConstructor();
      g.addNode(1, "foo");
      assert.throws(function() { fromSuper(g); });
    });

    it("includes edges from the source graph", function() {
      var g = new SuperConstructor();
      g.addNode(1);
      var edgeId = g.addEdge(null, 1, 1);
      assert.sameMembers(fromSuper(g).edges(), [edgeId]);
    });

    it("includes edge attributes from the source graph", function() {
      var g = new SuperConstructor();
      g.addNode(1);
      var edgeId = g.addEdge(null, 1, 1, {a: "a-value"});
      assert.deepEqual(fromSuper(g).edge(edgeId), {a: "a-value"});
    });

    it("has the same incidentNodes for edges from the source graph", function() {
      var g = new SuperConstructor();
      g.addNode(1);
      g.addNode(2);
      var edgeId = g.addEdge(null, 1, 2);
      assert.deepEqual(fromSuper(g).incidentNodes(edgeId), [1, 2]);
    });

    it("fails to convert a graph with non-object edge values", function() {
      var g = new SuperConstructor();
      g.addNode(1);
      g.addEdge(null, 1, 1, "foo");
      assert.throws(function() { fromSuper(g); });
    });
  });
};
