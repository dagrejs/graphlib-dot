var Digraph = require("graphlib").Digraph;

module.exports = write;

/*
 * Writes a string representation of the given graph in the DOT language.
 *
 * Note: this is exported as the module export
 *
 * @param {Digraph} g the graph to serialize
 */
function write(g) {
  var edgeConnector = g instanceof Digraph ? "->" : "--";
  var str = g instanceof Digraph ? "digraph" : "graph";
  str += " {\n";

  g.nodes().forEach(function(u) {
    str += _writeNode(u, g.node(u));
  });

  g.eachEdge(function(id, source, target, value) {
    str += _writeEdge(id, edgeConnector, source, target, value);
  });

  str += "}\n";
  return str;
}

function id(obj) {
  return '"' + obj.toString().replace(/"/g, '\\"') + '"';
}

function idVal(obj) {
  if (Object.prototype.toString.call(obj) === "[object Object]" ||
      Object.prototype.toString.call(obj) === "[object Array]") {
    return id(JSON.stringify(obj));
  }
  return id(obj);
}

function _writeNode(u, attrs) {
  var _id = id(u);
  var str = "    " + id(u);
  var hasAttrs = false;
  for (var k in attrs) {
    
    if((k === "label" || k === "id") && id(attrs[k]) !== _id) {
      if (!hasAttrs) {
        str += " [";
        hasAttrs = true;
      } else {
        str += ",";
      }
      str += id(k) + "=" + idVal(attrs[k]);
    }
  }
  if (hasAttrs) {
    str += "]";
  }
  str += "\n";
  return str;
}

function _writeEdge(eId, edgeConnector, u, v, attrs) {
  var _id = id(eId);
  var str = "    " + id(u) + " " + edgeConnector + " " + id(v);
  var hasAttrs = false;
  for (var k in attrs) {
//TODO: don't output edge id if it's only the default id.
//not sure where the default id is created...
//      if((k == 'id') && id(attrs[k]) != _id) {
      if (!hasAttrs) {
        str += " [";
        hasAttrs = true;
      } else {
        str += ",";
      }
      str += id(k) + "=" + idVal(attrs[k]);
//    }
  }
  if (hasAttrs) {
    str += "]";
  }
  str += "\n";
  return str;
}

