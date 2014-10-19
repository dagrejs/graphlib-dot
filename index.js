var read = require("./lib/read-one"),
    readMany = require("./lib/read-many"),
    write = require("./lib/write-one"),
    version = require("./lib/version");

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
