var parse = require("./parse"),
    write = require("./write");

exports.parse = exports.decode = parse;
exports.parseMany = parse.parseMany;
exports.write = exports.encode = write;

// This makes graphlib-dot a valid levelup encoding.
exports.type = "dot";
exports.buffer = false;
