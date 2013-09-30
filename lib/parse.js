var DotDigraph = require("./DotDigraph"),
    DotGraph = require("./DotGraph");

var dot_parser = require("./dot-grammar");

module.exports = parse;
module.exports.parseMany = parseMany;

/*
 * Parses a single DOT graph from the given string and returns it as one of:
 *
 * * `Digraph` if the input graph is a `digraph`.
 * * `Graph` if the input graph is a `graph`.
 *
 * Note: this is exported as the module export.
 *
 * @param {String} str the DOT string representation of one or more graphs
 */
function parse(str) {
  var parseTree = dot_parser.parse(str, "graphStmt");
  return buildGraph(parseTree);
}

/*
 * Parses one or more DOT graphs in the given string and returns them using
 * the same rules as described in [parse][] for individual graphs.
 *
 * [parse]: parse.js.html#parse
 *
 * @param {String} str the DOT string representation of one or more graphs
 */
function parseMany(str) {
  var parseTree = dot_parser.parse(str);

  return parseTree.map(function(subtree) {
    return buildGraph(subtree);
  });
}

function buildGraph(parseTree) {
  var g = parseTree.type === "graph" ? new DotGraph() : new DotDigraph();

  function createNode(id, attrs, sg) {
    if (!(g.hasNode(id))) {
      // We only apply default attributes to a node when it is first defined.
      // If the node is subsequently used in edges, we skip apply default
      // attributes.
      g.addNode(id, defaultAttrs.get("node", {}));

      // The "label" attribute is given special treatment: if it is not
      // defined we set it to the id of the node.
      if (g.node(id).label === undefined) {
        g.node(id).label = id;
      }

      if (sg !== null) {
        g.parent(id, sg);
      }
    }
    if (attrs) {
      mergeAttributes(attrs, g.node(id));
    }
  }

  function createEdge(source, target, attrs) {
    var edge = {};
    mergeAttributes(defaultAttrs.get("edge", attrs), edge);
    var id = attrs.id ? attrs.id : null;
    g.addEdge(id, source, target, edge);
  }

  function collectNodeIds(stmt) {
    var ids = {},
        stack = [],
        curr;
    function pushStack(e) { stack.push(e); }

    pushStack(stmt);
    while (stack.length !== 0) {
      curr = stack.pop();
      switch (curr.type) {
        case "node": ids[curr.id] = true; break;
        case "edge":
          curr.elems.forEach(pushStack);
          break;
        case "subgraph":
          curr.stmts.forEach(pushStack);
          break;
      }
    }
    return Object.keys(ids);
  }

  /*
   * We use a chain of prototypes to maintain properties as we descend into
   * subgraphs. This allows us to simply get the value for a property and have
   * the VM do appropriate resolution. When we leave a subgraph we simply set
   * the current context to the prototype of the current defaults object.
   * Alternatively, this could have been written using a stack.
   */
  var defaultAttrs = {
    _default: {},

    get: function get(type, attrs) {
      if (typeof this._default[type] !== "undefined") {
        var mergedAttrs = {};
        // clone default attributes so they won't get overwritten in the next step
        mergeAttributes(this._default[type], mergedAttrs);
        // merge statement attributes with default attributes, precedence give to stmt attributes
        mergeAttributes(attrs, mergedAttrs);
        return mergedAttrs;
      } else {
        return attrs;
      }
    },

    set: function set(type, attrs) {
      this._default[type] = this.get(type, attrs);
    },

    enterSubDigraph: function() {
      function SubDigraph() {}
      SubDigraph.prototype = this._default;
      var subgraph = new SubDigraph();
      this._default = subgraph;
    },

    exitSubDigraph: function() {
      this._default = Object.getPrototypeOf(this._default);
    }
  };

  function handleStmt(stmt, sg) {
    var attrs = stmt.attrs;
    switch (stmt.type) {
      case "node":
        createNode(stmt.id, attrs, sg);
        break;
      case "edge":
        var prev,
            curr;
        stmt.elems.forEach(function(elem) {
          handleStmt(elem, sg);

          switch(elem.type) {
            case "node": curr = [elem.id]; break;
            case "subgraph": curr = collectNodeIds(elem); break;
            default:
              // We don't currently support subgraphs incident on an edge
              throw new Error("Unsupported type incident on edge: " + elem.type);
          }

          if (prev) {
            prev.forEach(function(p) {
              curr.forEach(function(c) {
                createEdge(p, c, attrs);
              });
            });
          }
          prev = curr;
        });
        break;
      case "subgraph":
        defaultAttrs.enterSubDigraph();
        stmt.id = g.addNode(stmt.id);
        if (sg !== null) { g.parent(stmt.id, sg); }
        if (stmt.stmts) {
          stmt.stmts.forEach(function(s) { handleStmt(s, stmt.id); });
        }
        // If no children we remove the subgraph
        if (g.children(stmt.id).length === 0) {
          g.delNode(stmt.id);
        }
        defaultAttrs.exitSubDigraph();
        break;
      case "attr":
        defaultAttrs.set(stmt.attrType, attrs);
        break;
      default:
        throw new Error("Unsupported statement type: " + stmt.type);
    }
  }

  if (parseTree.stmts) {
    parseTree.stmts.forEach(function(stmt) {
      handleStmt(stmt, null);
    });
  }

  return g;
}

// Copies all key-value pairs from `src` to `dst`. This copy is destructive: if
// a key appears in both `src` and `dst` the value from `src` will overwrite
// the value in `dst`.
function mergeAttributes(src, dst) {
  Object.keys(src).forEach(function(k) { dst[k] = src[k]; });
}
