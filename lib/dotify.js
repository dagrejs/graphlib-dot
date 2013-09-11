// This file provides a helper function that mixes-in Dot behavior to an
// existing graph prototype.

var util = require("./util"),
    /* jshint -W079 */
    Set = require("graphlib").data.Set;

module.exports = dotify;

// Extends the given SuperConstructor with DOT behavior and returns the new
// constructor.
function dotify(SuperConstructor) {
  function Constructor() {
    SuperConstructor.call(this);

    // Maps (node|edge|subgraph) id -> type ("node" | "edge" | "subgraph")
    this._types = {};

    // Map of object id -> parent subgraph id (or null for root graph)
    this._parents = {};

    // Map of subgraph id -> { id, value }
    this._subgraphs = {};

    // Map of subgraph id (or null) -> children set
    this._children = { null: new Set() };
  }

  Constructor.prototype = new SuperConstructor();
  Constructor.prototype.constructor = Constructor;

  Constructor.prototype.hasSubgraph = function(id) {
    return id in this._subgraphs;
  };

  Constructor.prototype.subgraph = function(id, value) {
    var subgraph = this._subgraphs[id];
    if (subgraph === undefined) {
      throw new Error("No subgraph with id " + id + " in this graph");
    }
    if (arguments.length < 2) {
      return subgraph.value;
    }
    this._checkValueType(value);
    subgraph.value = value;
  };

  Constructor.prototype.subgraphs = function() {
    return util.values(this._subgraphs).map(function(subgraph) { return subgraph.id; });
  };

  Constructor.prototype.parent = function(id, parent) {
    if (id === parent) {
      throw new Error("Cannot make " + id + " a parent of itself");
    }

    if (!(id in this._parents)) {
      throw new Error("No object with id " + id + " in this graph");
    }

    if (arguments.length < 2) {
      return this._parents[id];
    }

    this._children[this._parents[id]].remove(id);
    this._parents[id] = parent;
    this._children[parent].add(id);
  };

  // Unlike most of the rest of the subgraph related code this function allows
  // `null` to signify the root graph.
  Constructor.prototype.children = function(id) {
    if (!(id in this._children)) {
      throw new Error("No subgraph with id " + id + " in this graph.");
    }
    return this._children[id].keys().map(function(child) {
      return { id: child, type: this._types[child] };
    }, this);
  };

  Constructor.prototype.addSubgraph = function(id, value) {
    if (arguments.length < 2) {
      value = {};
    }
    this._checkValueType(value);
    id = this._tryReserveId(id, "subgraph");
    this._subgraphs[id] = { id: id, value: value };
    this._children[id] = new Set();
    return id;
  };

  Constructor.prototype.delSubgraph = function(id) {
    this._freeId(id, "subgraph");

    var parent = this.parent(id);
    // Promote all children to the parent of the subgraph
    this._children[id].keys().forEach(function(child) {
      this.parent(child, parent);
    }, this);
    delete this._subgraphs[id];
    delete this._parents[id];
    delete this._children[id];
  };

  Constructor.prototype.node = function(u, value) {
    if (arguments.length < 2) {
      return SuperConstructor.prototype.node.call(this, u);
    }
    this._checkValueType(value);
    return SuperConstructor.prototype.node.call(this, u, value);
  };

  Constructor.prototype.addNode = function(u, value) {
    if (arguments.length < 2) {
      value = {};
    }
    this._checkValueType(value);
    u = this._tryReserveId(u, "node");
    SuperConstructor.prototype.addNode.call(this, u, value);
  };

  Constructor.prototype.delNode = function(u) {
    this._freeId(u, "node");
    SuperConstructor.prototype.delNode.call(this, u);
  };

  Constructor.prototype.edge = function(e, value) {
    if (arguments.length < 2) {
      return SuperConstructor.prototype.edge.call(this, e);
    }
    this._checkValueType(value);
    return SuperConstructor.prototype.edge.call(this, e, value);
  };

  Constructor.prototype.addEdge = function(e, u, v, value) {
    if (arguments.length < 4) {
      value = {};
    }
    this._checkValueType(value);
    e = this._tryReserveId(e, "edge");
    SuperConstructor.prototype.addEdge.call(this, e, u, v, value);
  };

  Constructor.prototype.delEdge = function(e) {
    this._freeId(e, "edge");
    SuperConstructor.prototype.delEdge.call(this, e);
  };

  Constructor.prototype._tryReserveId = function(id, type) {
    if (id === undefined || id === null) {
      do {
        id = "_" + (++this._nextId);
      } while (id in this._types);
    } else {
      if (id in this._types) {
        throw new Error("id " + id + " already used by a " + this._types[id] + " in this graph.");
      }
    }
    this._parents[id] = null;
    this._children[null].add(id);
    this._types[id] = type;
    return id;
  };

  Constructor.prototype._freeId = function(id, type) {
    var registeredType = this._types[id];
    if (registeredType === undefined) {
      throw new Error("No " + type + " registered with id " + id);
    } else if (registeredType !== type) {
      throw new Error("Type for id " + id + " was expected to be " + type +
                      " but was " + registeredType);
    }
    delete this._types[id];
  };

  Constructor.prototype._checkValueType = function(value) {
    if (value === null || typeof value !== "object") {
      throw new Error("Value must be non-null and of type 'object'");
    }
  };

  return Constructor;
}
