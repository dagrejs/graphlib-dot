var read = require("./lib/read-one");
var readMany = require("./lib/read-many");
var write = require("./lib/write-one");
var version = require("./lib/version");

module.exports = {
  graphlib: require("./lib/graphlib"),

  // Parsing
  read: read,
  readMany: readMany,

  // Writing
  write: write,

  // Version
  version: version,

  // For levelup encoding
  type: "dot",
  buffer: false
};
