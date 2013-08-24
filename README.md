# graphlib-dot

parse `dot` format into `graphlib` api.

<!--
[![Build Status](https://secure.travis-ci.org/cpettitt/dagre.png)](http://travis-ci.org/cpettitt/dagre)

[![browser support](https://ci.testling.com/cpettitt/dagre.png)](https://ci.testling.com/cpettitt/dagre)
-->

## Example

``` js

var fs = require('fs')
var dot = requrie('graphlib-dot')

var graph = dot.decode(fs.readFileSync('your-dot-file.dot'))
//then you can pass this to dagre or some other graphlib compatible
//graph library.
```

see also [dagre](https://github.com/cpettitt/dagre)

## License

MIT
