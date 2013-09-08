var parse = require("./lib/parse"),
    write = require("./lib/write");

module.exports = {
  parse: parse,
  decode: parse,

  parseMany: parse.parseMany,

  write: write,
  encode: write,

  // For levelup encoding
  type: "dot",
  buffer: false
};
