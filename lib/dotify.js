// This file provides a helper function that mixes-in Dot behavior to an
// existing graph prototype.

module.exports = dotify;

// Extends the given SuperConstructor with DOT behavior and returns the new
// constructor.
function dotify(SuperConstructor) {
  function Constructor() {
    SuperConstructor.call(this);
    this.graph({});
  }

  Constructor.prototype = new SuperConstructor();
  Constructor.prototype.constructor = Constructor;

  Constructor.prototype.graph = function(value) {
    if (arguments.length < 1) {
      return SuperConstructor.prototype.graph.call(this);
    }
    this._checkValueType(value);
    return SuperConstructor.prototype.graph.call(this, value);
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
    return SuperConstructor.prototype.addNode.call(this, u, value);
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
    return SuperConstructor.prototype.addEdge.call(this, e, u, v, value);
  };

  Constructor.prototype._checkValueType = function(value) {
    if (value === null || typeof value !== "object") {
      throw new Error("Value must be non-null and of type 'object'");
    }
  };

  return Constructor;
}
