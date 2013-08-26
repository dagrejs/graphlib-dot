# graphlib-dot

A DOT language parser / writer for [graphlib](https://github.com/cpettitt/graphlib).

[![Build Status](https://secure.travis-ci.org/cpettitt/graphlib-dot.png)](http://travis-ci.org/cpettitt/graphlib-dot)

[![browser support](https://ci.testling.com/cpettitt/graphlib-dot.png)](https://ci.testling.com/cpettitt/graphlib-dot)

## Build / Install

Before building this library you need to install the [npm package manager].

To get graphlib-dot from npm, use:

    $ npm install graphlib-dot

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

## License

graphlib-dot is licensed under the terms of the MIT License. See the LICENSE file
for details.

[npm package manager]: http://npmjs.org/
