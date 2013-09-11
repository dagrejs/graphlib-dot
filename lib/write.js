var Digraph = require("graphlib").Digraph,
    Writer = require("./Writer");

module.exports = write;

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
  writer.write(g instanceof Digraph ? "digraph" : "graph");
  writer.writeLine(" {");
  writer.indent();

  g.nodes().forEach(function(u) {
    _writeNode(u, g.node(u), writer);
  });

  g.eachEdge(function(id, source, target, value) {
    _writeEdge(id, ec, source, target, value, writer);
  });

  writer.unindent();
  writer.writeLine("}");
  return writer.toString();
}

function id(obj) {
  return '"' + obj.toString().replace(/"/g, '\\"') + '"';
}

function _writeNode(u, attrs, writer) {
  writer.write(id(u));
  var attrStrs = Object.keys(attrs).map(function(k) {
    return id(k) + "=" + id(attrs[k]);
  });

  if (attrStrs.length) {
    writer.write(" [" + attrStrs.join(",") + "]");
  }

  writer.writeLine();
}

function _writeEdge(eId, ec, u, v, attrs, writer) {
  writer.write(id(u) + " " + ec + " " + id(v));
  var attrStrs = Object.keys(attrs).map(function(k) {
    return id(k) + "=" + id(attrs[k]);
  });

  if (attrStrs.length) {
    writer.write(" [" + attrStrs.join(",") + "]");
  }

  writer.writeLine();
}

