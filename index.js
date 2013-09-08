var parse = require("./lib/parse"),
    write = require("./lib/write"),
    version = require("./lib/version");

module.exports = {
  parse: parse,
  decode: parse,

  parseMany: parse.parseMany,

  write: write,
  encode: write,

  version: version,

  // For levelup encoding
  type: "dot",
  buffer: false
};
