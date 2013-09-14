# graphlib-dot

A DOT language parser / writer for [graphlib](https://github.com/cpettitt/graphlib).

[![Build Status](https://secure.travis-ci.org/cpettitt/graphlib-dot.png)](http://travis-ci.org/cpettitt/graphlib-dot)

[![browser support](https://ci.testling.com/cpettitt/graphlib-dot.png)](https://ci.testling.com/cpettitt/graphlib-dot)

Note that graphlib-dot is current a pre-1.0.0 library. We will do our best to
maintain backwards compatibility, for patch level increases (e.g. 0.0.1 to
0.0.2) but make no claim to backwards compatibility across minor releases (e.g.
0.0.1 to 0.1.0). Watch our [CHANGELOG](CHANGELOG.md) for details on changes.

# Getting graphlib-dot

## NPM Install

Before installing this library you need to install the [npm package manager].

To get graphlib from npm, use:

    $ npm install graphlib-dot

## Browser Scripts

You can get the latest browser-ready scripts:

* [graphlib-dot.js](http://cpettitt.github.io/project/graphlib-dot/latest/graphlib-dot.js)
* [graphlib-dot.min.js](http://cpettitt.github.io/project/graphlib-dot/latest/graphlib-dot.min.js)

## Build From Source

Before building this library you need to install the [npm package manager].

Check out this project and run this command from the root of the project:

    $ make

This will generate `graphlib-dot.js` and `graphlib-dot.min.js` in the `out/dist` directory.

## Example

``` js

var fs = require('fs')
var dot = require('graphlib-dot')

var graph = dot.decode(fs.readFileSync('your-dot-file.dot'))
//then you can pass this to dagre or some other graphlib compatible
//graph library.

//also encode a graph back to a string!
console.log(dot.encode(graph))
```

# API

[API documentation](http://cpettitt.github.io/project/graphlib-dot/latest/doc/index.html)

## License

graphlib-dot is licensed under the terms of the MIT License. See the LICENSE file
for details.

[npm package manager]: http://npmjs.org/
