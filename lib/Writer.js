// A simple class for pretty printing strings with indentation

module.exports = Writer;

var INDENT = "    ";

function Writer() {
  this._indent = "";
  this._content = "";
  this._shouldIndent = true;
}

Writer.prototype.indent = function() {
  this._indent += INDENT;
};

Writer.prototype.unindent = function() {
  this._indent = this._indent.slice(INDENT.length);
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
