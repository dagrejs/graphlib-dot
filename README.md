# graphlib-dot

A [DOT language](http://www.graphviz.org/content/dot-language) parser / writer for [graphlib](https://github.com/cpettitt/graphlib).

[![Build Status](https://secure.travis-ci.org/cpettitt/graphlib-dot.png)](http://travis-ci.org/cpettitt/graphlib-dot)

Note that graphlib-dot is current a pre-1.0.0 library. We will do our best to
maintain backwards compatibility for patch level increases (e.g. 0.0.1 to
0.0.2), but make no claim to backwards compatibility across minor releases (e.g.
0.0.1 to 0.1.0). Watch our [CHANGELOG](CHANGELOG.md) for details on changes.

We're currently working towards a v1.0.0 release that will stabilize the API.
Please file issues for anything that should be addressed before the switch 1.0.

# Getting graphlib-dot

## NPM Install

Before installing this library you need to install the [npm package manager].

To get graphlib-dot from npm, use:

    $ npm install graphlib-dot

## Bower Install

You can install graphlib-dot with bower using the following command:

    $ bower install graphlib-dot

## Build From Source

Before building this library you need to install the [npm package manager].

Check out this project and run this command from the root of the project:

    $ make

This will generate `graphlib-dot.js` and `graphlib-dot.min.js` in the `dist` directory.

# Example

``` js
var fs = require('fs')
var dot = require('graphlib-dot')

var graph = dot.read(fs.readFileSync('your-dot-file.dot'))
// Tou can pass `graph` to dagre or some other graphlib compatible
// graph library.

// You can also write a graph to a graphviz string.
console.log(dot.write(graph))
```

# API

## read(str)

Reads a single DOT graph from the `str` and returns it a `Graph`
representation. By default the `Graph` will be a compound multigraph. Using the
`strict` keyword changes the `Graph` to a compound graph without multi-edges.
Use the `digraph` keyword to create a directed graph and the `graph` keyword to
create an undirected graph.

```js
var dot = require("graphlib-dot");

var digraph = dot.read("digraph { 1; 2; 1 -> 2 [label=\"label\"] }");
digraph.nodes();
// => [ "1", "2" ]

digraph.edges();
// => [ { v: "1", w: "2" } ]

digraph.edge("1", "2");
// => { label: "label" }
```

This function treats subgraphs in the input as nodes in the final DOT graph,
which will have one or more children. Empty subgraphs in the input are not
included in the final graph.

```js
var dot = require("graphlib-dot");

var digraph = dot.read("digraph { 1; 2; subgraph X { 3; 4 }; subgraph Y {} }");
digraph.nodes();
// => [ "1", "2", "3", "4", "X" ]
// Note in particular that "Y" was not included because it was empty

digraph.children();
// => [ "1", "2", "X" ]
// Note that calling children without any arguments returns children without
// a parent.

digraph.children("X");
// => [ "3", "4" ]
```

Defaults in the input graph are applied to objects (`node`, `edge`, `graph`) as
described by the rules of the DOT language. However, the default information
itself is not preserved during the parsing process. Graphviz's DOT also loses
default information under most circumstances; however we've opted to make it
consistently always the case.

### readMany(str)

Parses one or more DOT graphs from `str` in a manner similar to that used
by parse for individual graphs.

```js
var dot = require("graphlib-dot");

var digraphs = dot.readMany("digraph { 1; 2; 1 -> 2 [label=\"label\"] }\n" +
                            "digraph { A; B; }");
digraphs.length;
// => 2
```

### write(graph)

Writes a `String` representation of the given `graph` in the DOT language.

```js
var Graph = require("graphlib").Graph,
    dot = require("graphlib-dot");

var digraph = new Graph();
digraph.setNode(1);
digraph.setNode(2);
digraph.setEdge(1, 2, { label: "A label" });
console.log(dot.write(digraph));
// Prints:
//
//  strict digraph {
//      "1"
//      "2"
//      1 -> 2 [label="A label"]
//  }
```

Note that the graph was "strict" because we did not construct it with the `multigraph` proeprty. To get a non-strict graph:

```js
var Graph = require("graphlib").Graph,
    dot = require("graphlib-dot");

var digraph = new Graph({ multigraph: true });
digraph.setNode(1);
digraph.setNode(2);
digraph.setEdge(1, 2, { label: "A label" });
console.log(dot.write(digraph));
// Prints:
//
//  digraph {
//      "1"
//      "2"
//      1 -> 2 [label="A label"]
//  }
```

# Limitations

* The parser does not work for HTML strings.
* The parser ignores port and compass statements when handling node statements.
  For example, a node `a:port:nw [attr1=val]' will be treated as though it were
  defined `a [attr1=val]`.
* Defaults are expanded during parsing and are otherwise not preserved. This is
  similar to the behavior exhibited by `dot`.

# License

graphlib-dot is licensed under the terms of the MIT License. See the LICENSE file
for details.

[npm package manager]: http://npmjs.org/
