var Digraph = require("graphlib").Digraph,
    Writer = require("./Writer");

module.exports = write;

var UNESCAPED_ID_PATTERN = /[a-zA-Z\200-\377_][a-zA-Z\200-\377_0-9]*/;

/*
 * Writes a string representation of the given graph in the DOT language.
 *
 * Note: this is exported as the module export
 *
 * @param {Graph|Digraph} g the graph to serialize
 */
function write(g) {
  var ec = g instanceof Digraph ? "->" : "--";
  var writer = new Writer();

  writeSubgraph(g instanceof Digraph ? "digraph" : "graph",
                g, null, ec, writer);

  return writer.toString();
}

function writeSubgraph(openStmt, g, subgraphId, ec, writer) {
  writer.writeLine(openStmt + " {");
  writer.indent();

  g.children(subgraphId).forEach(function(child) {
    switch (child.type) {
      case "node":
        writeNode(g, child.id, writer);
        break;
      case "edge":
        writeEdge(g, child.id, ec, writer);
        break;
      case "subgraph":
        writeSubgraph("subgraph " + id(child.id), g, child.id, ec, writer);
        break;
      default:
        throw new Error("Unexpected child type: " + child.type);
    }
  });

  writer.unindent();
  writer.writeLine("}");
}

function id(obj) {
  if (typeof obj === "number" || obj.toString().match(UNESCAPED_ID_PATTERN)) {
    return obj;
  }

  return '"' + obj.toString().replace(/"/g, '\\"') + '"';
}

function writeNode(g, u, writer) {
  var attrs = g.node(u);
  writer.write(id(u));
  var attrStrs = Object.keys(attrs).map(function(k) {
    return id(k) + "=" + id(attrs[k]);
  });

  if (attrStrs.length) {
    writer.write(" [" + attrStrs.join(",") + "]");
  }

  writer.writeLine();
}

function writeEdge(g, e, ec, writer) {
  var attrs = g.edge(e),
      incident = g.incidentNodes(e),
      u = incident[0],
      v = incident[1];

  writer.write(id(u) + " " + ec + " " + id(v));
  var attrStrs = Object.keys(attrs).map(function(k) {
    return id(k) + "=" + id(attrs[k]);
  });

  if (attrStrs.length) {
    writer.write(" [" + attrStrs.join(",") + "]");
  }

  writer.writeLine();
}

