var fs = require('fs')
var assert = require("chai").assert
var dot = require('../')

var examples = [
  fs.readFileSync(__dirname + '/fixtures/barabasi_5_5_2.dot', 'utf8'),
  fs.readFileSync(__dirname + '/fixtures/barabasi_5_10_4.dot', 'utf8'),
  fs.readFileSync(__dirname + '/fixtures/barabasi_5_3_3.dot', 'utf8'),
  fs.readFileSync(__dirname + '/fixtures/barabasi_5_1_4.dot', 'utf8')
]

var stringify = require('../lib/stringify')

//var assert = require('assert')
//  .deepEqual(dot.parse(_d), dot.parse(d))

describe("dot.encode", function() {
  describe("encode", function() {
    
    examples.forEach(function (v, i) {
      it("encodes and decodes: " + i, function() {      
        var g = dot.decode(v);
        assert.deepEqual(g, dot.decode(dot.encode(g)));
      });

      it("encodes to the same thing: " + i, function() {
      
        var g = dot.parse(v);
        assert.deepEqual(dot.encode(g), dot.encode(dot.decode(dot.encode(g))));
      });
      
    });
  });
});

