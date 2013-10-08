var Digraph = require('graphlib').Digraph,
    Writer = require('./Writer');

module.exports = write;

var UNESCAPED_ID_PATTERN = /^[a-zA-Z\200-\377_][a-zA-Z\200-\377_0-9]*$/;

/*
 * Writes a string representation of the given graph in the DOT language.
 *
 * Note: this is exported as the module export
 *
 * @param {Graph|Digraph} g the graph to serialize
 */
function write(g) {
  var ec = g instanceof Digraph ? '->' : '--';
  var writer = new Writer();

  writer.writeLine((g instanceof Digraph ? 'digraph' : 'graph') + ' {');
  writer.indent();

  var graphAttrs = g.graph();
  Object.keys(graphAttrs).map(function(k) {
    writer.writeLine(id(k) + '=' + id(graphAttrs[k]) + ';');
  });

  writeSubgraph(g, null, writer);

  g.edges().forEach(function(e) {
    writeEdge(g, e, ec, writer);
  });

  writer.unindent();
  writer.writeLine('}');

  return writer.toString();
}

function writeSubgraph(g, u, writer) {
  g.children(u).forEach(function(v) {
    if (g.children(v).length === 0) {
      writeNode(g, v, writer);
    } else {
      writer.writeLine('subgraph ' + id(v) + ' {');
      writer.indent();

      var attrs = g.node(v);
      Object.keys(attrs).map(function(k) {
        writer.writeLine(id(k) + '=' + id(attrs[k]) + ';');
      });

      writeSubgraph(g, v, writer);
      writer.unindent();
      writer.writeLine('}');
    }
  });
}

function id(obj) {
  if (typeof obj === 'number' || obj.toString().match(UNESCAPED_ID_PATTERN)) {
    return obj;
  }

  return '"' + obj.toString().replace(/"/g, '\\"') + '"';
}

function writeNode(g, u, writer) {
  var attrs = g.node(u);
  writer.write(id(u));
  var attrStrs = Object.keys(attrs).map(function(k) {
    return id(k) + '=' + id(attrs[k]);
  });

  if (attrStrs.length) {
    writer.write(' [' + attrStrs.join(',') + ']');
  }

  writer.writeLine();
}

function writeEdge(g, e, ec, writer) {
  var attrs = g.edge(e),
      incident = g.incidentNodes(e),
      u = incident[0],
      v = incident[1];

  writer.write(id(u) + ' ' + ec + ' ' + id(v));
  var attrStrs = Object.keys(attrs).map(function(k) {
    return id(k) + '=' + id(attrs[k]);
  });

  if (attrStrs.length) {
    writer.write(' [' + attrStrs.join(',') + ']');
  }

  writer.writeLine();
}

