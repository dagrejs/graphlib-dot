/* global window */

var lodash;

if (require) {
  try {
    lodash = require("lodash");
  } catch (e) {
    // continue regardless of error
  }
}

if (!lodash) {
  lodash = window._;
}

module.exports = lodash;
