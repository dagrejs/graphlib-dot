"use strict";

var _ = require("./lodash");
var Graph = require("./graphlib").Graph;

module.exports = buildGraph;

function buildGraph(parseTree) {
  var isDirected = parseTree.type !== "graph",
    isMultigraph = !parseTree.strict,
    defaultStack = [{ node: {}, edge: {} }],
    id = parseTree.id,
    g = new Graph({ directed: isDirected, multigraph: isMultigraph, compound: true });
  g.setGraph(id === null ? {} : {id: id});
  _.each(parseTree.stmts, function(stmt) { handleStmt(g, stmt, defaultStack); });
  return g;
}

function handleStmt(g, stmt, defaultStack, sg) {
  switch(stmt.type) {
  case "node": handleNodeStmt(g, stmt, defaultStack, sg); break;
  case "edge": handleEdgeStmt(g, stmt, defaultStack, sg); break;
  case "subgraph": handleSubgraphStmt(g, stmt, defaultStack, sg); break;
  case "attr": handleAttrStmt(g, stmt, defaultStack); break;
  case "inlineAttr": handleInlineAttrsStmt(g, stmt, defaultStack, sg); break;
  }
}

function handleNodeStmt(g, stmt, defaultStack, sg) {
  var v = stmt.id,
    attrs = stmt.attrs;
  maybeCreateNode(g, v, defaultStack, sg);
  _.merge(g.node(v), attrs);
}

function handleEdgeStmt(g, stmt, defaultStack, sg) {
  var attrs = stmt.attrs,
    prev, curr;
  _.each(stmt.elems, function(elem) {
    handleStmt(g, elem, defaultStack, sg);

    switch(elem.type) {
    case "node": curr = [elem.id]; break;
    case "subgraph": curr = collectNodeIds(elem); break;
    }

    _.each(prev, function(v) {
      _.each(curr, function(w) {
        var name;
        if (g.hasEdge(v, w) && g.isMultigraph()) {
          name = _.uniqueId("edge");
        }
        if (!g.hasEdge(v, w, name)) {
          g.setEdge(v, w, _.clone(_.last(defaultStack).edge), name);
        }
        _.merge(g.edge(v, w, name), attrs);
      });
    });

    prev = curr;
  });
}

function handleSubgraphStmt(g, stmt, defaultStack, sg) {
  var id = stmt.id;
  if (id === undefined) {
    id = generateSubgraphId(g);
  }

  defaultStack.push(_.clone(_.last(defaultStack)));

  maybeCreateNode(g, id, defaultStack, sg);

  _.each(stmt.stmts, function(s) {
    handleStmt(g, s, defaultStack, id);
  });

  // If there are no statements remove the subgraph
  if (!g.children(id).length) {
    g.removeNode(id);
  }

  defaultStack.pop();
}

function handleAttrStmt(g, stmt, defaultStack) {
  _.merge(_.last(defaultStack)[stmt.attrType], stmt.attrs);
}

function handleInlineAttrsStmt(g, stmt, defaultStack, sg) {
  _.merge(sg ? g.node(sg) : g.graph(), stmt.attrs);
}

function generateSubgraphId(g) {
  var id;
  do {
    id = _.uniqueId("sg");
  } while (g.hasNode(id));
  return id;
}

function maybeCreateNode(g, v, defaultStack, sg) {
  if (!g.hasNode(v)) {
    g.setNode(v, _.clone(_.last(defaultStack).node));
    g.setParent(v, sg);
  }
}

// Collect all nodes involved in a subgraph statement
function collectNodeIds(stmt) {
  var ids = {},
    stack = [],
    curr;

  var push = stack.push.bind(stack);

  push(stmt);
  while(stack.length) {
    curr = stack.pop();
    switch(curr.type) {
    case "node": ids[curr.id] = true; break;
    case "edge": _.each(curr.elems, push); break;
    case "subgraph": _.each(curr.stmts, push); break;
    }
  }

  return _.keys(ids);
}

