module.exports = writeOne;

var UNESCAPED_ID_PATTERN = /^[a-zA-Z\200-\377_][a-zA-Z\200-\377_0-9]*$/;

function writeOne(g) {
  var ec = g.isDirected() ? "->" : "--";
  var writer = new Writer();

  if (!g.isMultigraph()) {
    writer.write("strict ");
  }

  writer.writeLine((g.isDirected() ? "digraph" : "graph") + " {");
  writer.indent();
  
  if (g.isCompound()) {
    writer.writeLine("compound=true;") 
  }

  var graphAttrs = g.graph();
  if (typeof graphAttrs === "object") {
    Object.entries(graphAttrs).forEach(([k, v]) => {
      writer.writeLine(id(k) + "=" + id(v) + ";");
    });
  }

  writeSubgraph(g, undefined, writer);

  g.edges().forEach(function(edge) {
    writeEdge(g, edge, ec, writer);
  });

  writer.unindent();
  writer.writeLine("}");

  return writer.toString();
}

function writeSubgraph(g, v, writer) {
  var children = g.isCompound() ? g.children(v) : g.nodes();
  children.forEach(w => {
    if (!g.isCompound() || !g.children(w).length) {
      writeNode(g, w, writer);
    } else {
      writer.writeLine("subgraph " + id(w) + " {");
      writer.indent();

      if (typeof g.node(w) === "object") {
        Object.entries(g.node(w)).map(([key, val]) => {
          writer.writeLine(id(key) + "=" + id(val) + ";");
        });
      }

      writeSubgraph(g, w, writer);
      writer.unindent();
      writer.writeLine("}");
    }
  });
}

function writeNode(g, v, writer) {
  writer.write(id(v));
  writeAttrs(g.node(v), writer);
  writer.writeLine();
}

function writeEdge(g, edge, ec, writer) {
  var v = edge.v;
  var w = edge.w;
  var attrs = g.edge(edge);

  writer.write(id(v) + " " + ec + " " + id(w));
  writeAttrs(attrs, writer);
  writer.writeLine();
}

function writeAttrs(attrs, writer) {
  if (typeof attrs === "object") {
    var attrStrs = Object.entries(attrs).map(([key, val]) => id(key) + "=" + id(val));
    if (attrStrs.length) {
      writer.write(" [" + attrStrs.join(",") + "]");
    }
  }
}

function id(obj) {
  if (typeof obj === "number" || obj.toString().match(UNESCAPED_ID_PATTERN)) {
    return obj;
  }

  return "\"" + obj.toString().replace(/"/g, "\\\"") + "\"";
}

// Helper object for making a pretty printer
function Writer() {
  this._indent = "";
  this._content = "";
  this._shouldIndent = true;
}

Writer.prototype.INDENT = "  ";

Writer.prototype.indent = function() {
  this._indent += this.INDENT;
};

Writer.prototype.unindent = function() {
  this._indent = this._indent.slice(this.INDENT.length);
};

Writer.prototype.writeLine = function(line) {
  this.write((line || "") + "\n");
  this._shouldIndent = true;
};

Writer.prototype.write = function(str) {
  if (this._shouldIndent) {
    this._shouldIndent = false;
    this._content += this._indent;
  }
  this._content += str;
};

Writer.prototype.toString = function() {
  return this._content;
};

