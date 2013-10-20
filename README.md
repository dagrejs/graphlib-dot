# graphlib-dot

A DOT language parser / writer for [graphlib](https://github.com/cpettitt/graphlib).

[![Build Status](https://secure.travis-ci.org/cpettitt/graphlib-dot.png)](http://travis-ci.org/cpettitt/graphlib-dot)

Note that graphlib-dot is current a pre-1.0.0 library. We will do our best to
maintain backwards compatibility for patch level increases (e.g. 0.0.1 to
0.0.2), but make no claim to backwards compatibility across minor releases (e.g.
0.0.1 to 0.1.0). Watch our [CHANGELOG](CHANGELOG.md) for details on changes.

# Getting graphlib-dot

## NPM Install

Before installing this library you need to install the [npm package manager].

To get graphlib-dot from npm, use:

    $ npm install graphlib-dot

## Browser Scripts

You can get the latest browser-ready scripts:

* [graphlib-dot.js](http://cpettitt.github.io/project/graphlib-dot/latest/graphlib-dot.js)
* [graphlib-dot.min.js](http://cpettitt.github.io/project/graphlib-dot/latest/graphlib-dot.min.js)

## Build From Source

Before building this library you need to install the [npm package manager].

Check out this project and run this command from the root of the project:

    $ make

This will generate `graphlib-dot.js` and `graphlib-dot.min.js` in the `dist` directory.

# Example

``` js
var fs = require('fs')
var dot = require('graphlib-dot')

var graph = dot.parse(fs.readFileSync('your-dot-file.dot'))
// Tou can pass `graph` to dagre or some other graphlib compatible
// graph library.

// You can also write a graph to a graphviz string.
console.log(dot.write(graph))
```

# API

## Graph Objects

This library introduces two new types of graphs:

1. `DotGraph` (prototype is [`CGraph`](http://cpettitt.github.io/project/graphlib/latest/doc/index.html#CGraph))
2. `DotDigraph` (prototype is [`CDigraph`](http://cpettitt.github.io/project/graphlib/latest/doc/index.html#CDigraph))

These graphs differ from the graphlib compound graphs in that they always contain
an object for their value. This is similar to how attributes work with graphs
in graphviz.

It is possible to serialize regular graphlib graphs provided the values used
for nodes, edges, and subgraphs are either `undefined` or are objects.

## Functions

### parse(str)

Parses a single DOT graph from the `str` and returns it as one of:

* `DotDigraph` if the input graph is `digraph`
* `DotGraph` if the input graph is a `graph`

```js
var dot = require("graphlib-dot");

var digraph = dot.parse("digraph { 1; 2; 1 -> 2 [label=\"label\"] }");
digraph.nodes();
// => [ "1", "2" ]

digraph.edge(digraph.edges()[0]);
// => { label: "label", id: /* unique id here */ }
```

This function treats subgraphs in the input as nodes in the final DOT graph,
which will have one or more children. Empty subgraphs in the input are not
included in the final graph.

```js
var dot = require("graphlib-dot");

var digraph = dot.parse("digraph { 1; 2; subgraph X { 3; 4 }; subgraph Y {} }");
digraph.nodes();
// => [ "1", "2", "3", "4", "X" ]
// Note in particular that "Y" was not included because it was empty

digraph.children(null);
// => [ "1", "2", "X" ]
// Note that `null` represents the root graph

digraph.children("X");
// => [ "3", "4" ]
```

Defaults in the input graph are applied to objects (`node`, `edge`, `graph`) as
described by the rules of the DOT language. However, the default information
itself is not preserved during the parsing process. Graphviz's DOT also loses
default information under most circumstances; however we've opted to make it
consistently always the case.

Also, unless otherwise specified we automatically add a label attribute to
each node that uses the node's id.

```js
var dot = require("graphlib-dot");

var digraph = dot.parse("digraph { 1; node [foo=bar]; 2 }");
digraph.nodes();
// => [ "1", "2" ]

digraph.node(1);
// => { label: "1" }

digraph.node(2);
// => { label: "2", foo: "bar" }
```

### parseMany(str)

Parses one or more DOT graphs from `str` in a manner similar to that used
by parse for individual graphs.

```js
var dot = require("graphlib-dot");

var digraphs = dot.parseMany("digraph { 1; 2; 1 -> 2 [label=\"label\"] }\n" +
                             "digraph { A; B; }");
digraphs.length;
// => 2
```

### write(graph)

Writes a `String` representation of the given `graph` in the DOT language.

```js
var Digraph = require("graphlib").Digraph,
    dot = require("graphlib-dot");

var digraph = new Digraph();
digraph.addNode(1);
digraph.addNode(2);
digraph.addEdge("A", 1, 2, { label: "A label" });
console.log(dot.write(digraph));
// Prints:
//
//  digraph {
//      "1"
//      "2"
//      "1" -> "2" ["label"="A label"]
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
