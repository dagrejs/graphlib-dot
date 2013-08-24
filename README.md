# graphlib-dot

parse `dot` format into `graphlib` api.

<!--
[![Build Status](https://secure.travis-ci.org/cpettitt/dagre.png)](http://travis-ci.org/cpettitt/dagre)

[![browser support](https://ci.testling.com/cpettitt/dagre.png)](https://ci.testling.com/cpettitt/dagre)
-->

## Example

``` js

var fs = require('fs')
var DOT = requrie('graphlib-dot')

var graph = DOT.decode(fs.readFileSync('your-dot-file.dot'))
//then you can pass this to dagre or some other graphlib compatible
//graph library.

//also encode a graph back to a string!
console.log(DOT.encode(graph))
```

see also [dagre](https://github.com/cpettitt/dagre)

## License

MIT
