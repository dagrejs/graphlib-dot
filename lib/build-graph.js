"use strict";

var Graph = require("@dagrejs/graphlib").Graph;

module.exports = buildGraph;

function buildGraph(parseTree) {
  var isDirected = parseTree.type !== "graph",
    isMultigraph = !parseTree.strict,
    defaultStack = [{ node: {}, edge: {} }],
    id = parseTree.id,
    g = new Graph({ directed: isDirected, multigraph: isMultigraph, compound: true });
  g.setGraph(id === null ? {} : {id: id});
  if (parseTree.stmts) {
    parseTree.stmts.forEach(stmt => handleStmt(g, stmt, defaultStack));
  }
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
  Object.assign(g.node(v), attrs);
}

function handleEdgeStmt(g, stmt, defaultStack, sg) {
  var attrs = stmt.attrs,
    prev, curr;
  stmt.elems.forEach(elem => {
    handleStmt(g, elem, defaultStack, sg);

    switch(elem.type) {
    case "node": curr = [elem.id]; break;
    case "subgraph": curr = collectNodeIds(elem); break;
    }

    if (prev) {
      prev.forEach(v => {
        curr.forEach(w => {
          var name;
          if (g.hasEdge(v, w) && g.isMultigraph()) {
            name = uniqueId("edge");
          }
          if (!g.hasEdge(v, w, name)) {
            g.setEdge(v, w, structuredClone(defaultStack[defaultStack.length - 1].edge), name);
          }
          Object.assign(g.edge(v, w, name), attrs);
        });
      });
    }

    prev = curr;
  });
}

function handleSubgraphStmt(g, stmt, defaultStack, sg) {
  var id = stmt.id;
  if (id === undefined) {
    id = generateSubgraphId(g);
  }

  defaultStack.push(structuredClone(defaultStack[defaultStack.length - 1]));

  maybeCreateNode(g, id, defaultStack, sg);

  if (stmt.stmts) {
    stmt.stmts.forEach(s => {
      handleStmt(g, s, defaultStack, id);
    });
  }

  // If there are no statements remove the subgraph
  if (!g.children(id).length) {
    g.removeNode(id);
  }

  defaultStack.pop();
}

function handleAttrStmt(g, stmt, defaultStack) {
  Object.assign(defaultStack[defaultStack.length - 1][stmt.attrType], stmt.attrs);
}

function handleInlineAttrsStmt(g, stmt, defaultStack, sg) {
  Object.assign(sg ? g.node(sg) : g.graph(), stmt.attrs);
}

function generateSubgraphId(g) {
  var id;
  do {
    id = uniqueId("sg");
  } while (g.hasNode(id));
  return id;
}

function maybeCreateNode(g, v, defaultStack, sg) {
  if (!g.hasNode(v)) {
    g.setNode(v, structuredClone(defaultStack[defaultStack.length - 1].node));
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
    case "edge": curr.elems.forEach(push); break;
    case "subgraph": curr.stmts.forEach(push); break;
    }
  }

  return Object.keys(ids);
}

let idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}
