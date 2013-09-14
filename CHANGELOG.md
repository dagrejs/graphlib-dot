v0.4.0
======

* Export this project as `graphlibDot` in the global namespace when using
  browser.js. Previously we erroneously exported with the name `graphlib`.

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
