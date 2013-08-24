module.exports = (function() {
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
    var _id = id(u)
    var str = "    " + id(u);
    var hasAttrs = false;
    for (var k in attrs) {
      
      if((k == 'label' || k == 'id') && id(attrs[k]) != _id) {
        if (!hasAttrs) {
          str += ' [';
          hasAttrs = true;
        } else {
          str += ',';
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
      if((k == 'id') && id(attrs[k]) != _id) {
        if (!hasAttrs) {
          str += ' [';
          hasAttrs = true;
        } else {
          str += ',';
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

  return function(g) {
    var edgeConnector = g.type == 'digraph' ? "->" : "--";
    var str = (g.type || 'digraph') + " {\n";

    g.nodes().forEach(function(u) {
      str += _writeNode(u, g.node(u));
    });
    console.log(g.edges())
    g.eachEdge(function(id, source, target, value) {
      str += _writeEdge(id, edgeConnector, source, target, value);
    });

    str += "}\n";
    return str;
  };
})();
