/*
 * Copies attributes from `src` to `dst`. If an attribute name is in both
 * `src` and `dst` then the attribute value from `src` takes precedence.
 */
exports.mergeAttributes = function(src, dst) {
  Object.keys(src).forEach(function(k) { dst[k] = src[k]; });
};
