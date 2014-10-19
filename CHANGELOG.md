v0.6.0
======

* dist scripts now included in the repo
* repo now supports direct bower install

v0.5.2
======

* Fix broken export for graphlib.

v0.5.1
======

* Export graphlib as a part of the browser bundle.

v0.5.0
======

* Rework to API and implementation to support graphlib v0.8.0.
* Support for writing strict graphs.

v0.4.10
=======

* Fixed grammar for parsing compass and port information
* Pull in graphlib v0.7.4

v0.4.9
======

* Allow serialization of non-compound graphs.
* Allow serialization of graphs / edges / nodes with no value (i.e. undefined).

v0.4.8
======

* Update to graphlib v0.7.0.

v0.4.7
======

* Bug fixes for `write` (properly detect that a graph is directed).

v0.4.6
======

* Partial fix for `write`. Please do not use this version. Use v0.4.7+ instead.

v0.4.5
======

* Add support for reading / writing graph and subgraph attributes.

v0.4.4
======

* Bug fixes for `write` (quoting keys / values as appropriate).

v0.4.3
======

* Bug fixes (nested subgraph parsing).

v0.4.2
======

* Bug fixes.

v0.4.1
======

* Use `id` attribute from edge as edge id when present.

v0.4.0
======

* Export this project as `graphlibDot` in the global namespace when using
  browser.js. Previously we erroneously exported with the name `graphlib`.
* Include "./lib/dot-grammar.js" in npm package.

v0.3.0
======

* Now DOT graphs in this library are based on compound graphs from graphlib.

v0.2.0
======

* Added `DotGraph` which adds more DOT-like behavior to graphlib's `Graph`. See
  API documentation for details.
* Added `DotDigraph` which adds more DOT-like behavior to graphlib's `Digraph`.
  See API documentation for details.
* `write` and `parse` now work with `DotGraph` and `DotDigraph`.

v0.1.0
======

* Initial support for parsing undirected graphs as a `Graph`, as opposed to a
  `Digraph` with 2 edges for each edge in the source graph.

v0.0.4
======

* Pull in graphlib 0.2.x

v0.0.3
======

* Pull in graphlib v0.1.x

v0.0.2
======

* Pull in graphlib v0.0.3

v0.0.1
======

* Initial release
