var common = require('./common'),
    path = require('path'),
    fs = common.fs,
    assert = common.assert,
    dot = require('..'),
    DotGraph = require('..').DotGraph,
    DotDigraph = require('..').DotDigraph;

describe('dot', function() {
  describe('parse', function() {
    it('can parse an empty digraph', function() {
      var g = dot.parse('digraph {}');
      assert.instanceOf(g, DotDigraph);
    });

    it('can parse an empty graph', function() {
      var g = dot.parse('graph {}');
      assert.instanceOf(g, DotGraph);
    });

    it('can parse a simple node', function() {
      var g = dot.parse('digraph { a }');
      assert.sameMembers(g.nodes(), ['a']);
    });

    it('can parse a node with an empty attribute', function() {
      var g = dot.parse('digraph { a [label=""]; }');
      assert.equal(g.node('a').label, '');
    });

    it('does not treat the id attribute for a node specially', function() {
      var g = dot.parse('digraph { a [id="b"]; }');
      assert.sameMembers(g.nodes(), ['a']);
    });

    it('can parse a simple undirected edge', function() {
      var g = dot.parse('graph { a -- b }');
      assert.sameMembers(g.nodes(), ['a', 'b']);
      assert.lengthOf(g.edges(), 1);
      assert.sameMembers(g.incidentNodes(g.edges()[0]), ['a', 'b']);
    });

    it('can parse a simple directed edge', function() {
      var g = dot.parse('digraph { a -> b }');
      assert.sameMembers(g.nodes(), ['a', 'b']);
      assert.lengthOf(g.edges(), 1);
      assert.equal(g.source(g.edges()[0]), 'a');
      assert.equal(g.target(g.edges()[0]), 'b');
    });

    it('can parse an edge with an id attribute', function() {
      var g = dot.parse('digraph { a -> b [id="A"]; }');
      assert.sameMembers(g.edges(), ['A']);
      assert.equal(g.source('A'), 'a');
      assert.equal(g.target('A'), 'b');
    });

    it('fails to parse a path with an id attribute', function() {
      assert.throws(function() { dot.parse('digraph { a -> b -> c [id="A"]; }'); },
                    /.*Graph already has edge 'A'.*/);
    });

    it('does not include empty subgraphs', function() {
      assert.lengthOf(dot.parse('digraph { subgraph X {} }').nodes(), 0);
      assert.lengthOf(dot.parse('digraph { subgraph {} }').nodes(), 0);
      assert.lengthOf(dot.parse('digraph { {} }').nodes(), 0);
    });

    it('can parse nodes in a subgraph', function() {
      var g = dot.parse('digraph { subgraph X { a; b }; c }');
      assert.sameMembers(g.nodes(), ['X', 'a', 'b', 'c']);
      assert.sameMembers(g.children(null), ['X', 'c']);
      assert.sameMembers(g.children('X'), ['a', 'b']);
    });

    it('can parse edges in a subgraph', function() {
      var g = dot.parse('digraph { subgraph X { a; b; a -> b } }');
      assert.sameMembers(g.nodes(), ['X', 'a', 'b']);
      assert.sameMembers(g.children(null), ['X']);
      assert.lengthOf(g.edges(), 1);
      assert.sameMembers(g.children('X'), ['a', 'b']);
    });

    it('can parse attributes in a subgraph', function() {
      var g = dot.parse('digraph { subgraph X { foo = bar; a; } }');
      assert.equal(g.node('X').foo, 'bar');
    });

    it('can parse nested subgraphs', function() {
      var g = dot.parse('digraph { subgraph X { subgraph Y { a; b } c } }');
      assert.sameMembers(g.nodes(), ['X', 'Y', 'a', 'b', 'c']);
      assert.sameMembers(g.children(null), ['X']);
      assert.sameMembers(g.children('X'), ['Y', 'c']);
      assert.sameMembers(g.children('Y'), ['a', 'b']);
    });

    it('adds default attributes to nodes', function() {
      var d = 'digraph { node [color=black shape=box]; n1 [label="n1"]; n2 [label="n2"]; n1 -> n2; }';
      var g = dot.parse(d);
      assert.equal(g.node('n1').color, 'black');
      assert.equal(g.node('n1').shape, 'box');
      assert.equal(g.node('n1').label, 'n1');

      assert.equal(g.node('n2').color, 'black');
      assert.equal(g.node('n2').shape, 'box');
      assert.equal(g.node('n2').label, 'n2');
    });

    it('combines multiple default attribute statements', function() {
      var d = 'digraph { node [color=black]; node [shape=box]; n1 [label="n1"]; }';
      var g = dot.parse(d);
      assert.equal(g.node('n1').color, 'black');
      assert.equal(g.node('n1').shape, 'box');
    });

    it('takes statement order into account when applying default attributes', function() {
      var d = 'digraph { node [color=black]; n1 [label="n1"]; node [shape=box]; n2 [label="n2"]; }';
      var g = dot.parse(d);
      assert.equal(g.node('n1').color, 'black');
      assert.isUndefined(g.node('n1').shape);

      assert.equal(g.node('n2').color, 'black');
      assert.equal(g.node('n2').shape, 'box');
    });

    it('overrides redefined default attributes', function() {
      var d = 'digraph { node [color=black]; n1 [label="n1"]; node [color=green]; n2 [label="n2"]; n1 -> n2; }';
      var g = dot.parse(d);
      assert.equal(g.node('n1').color, 'black');
      assert.equal(g.node('n2').color, 'green');

      // Implementation detail:
      // parse::handleStmt wants to assure that nodes used in an edge definition
      // are defined by calling createNode for those nodes. If these nested createNode
      // calls don't skip merging the default attributes, the attributes of already
      // defined nodes could be overwritten, causing both nodes in this test case to
      // have 'color' set to green. 
    });

    it('does not carry attributes from one node over to the next', function() {
      var d = 'digraph { node [color=black]; n1 [label="n1" fontsize=12]; n2 [label="n2"]; n1 -> n2; }';
      var g = dot.parse(d);
      assert.equal(g.node('n1').fontsize, 12);
      assert.isUndefined(g.node('n2').fontsize, 'n2.fontsize should not be defined');
    });

    it('applies default attributes to nodes created in an edge statement', function() {
      var d = 'digraph { node [color=blue]; n1 -> n2; }';
      var g = dot.parse(d);
      assert.equal(g.node('n1').color, 'blue');
      assert.equal(g.node('n2').color, 'blue');
    });

    it('applies default label if an explicit label is not set', function() {
      var d = 'digraph { node [label=xyz]; n2 [label=123]; n1 -> n2; }';
      var g = dot.parse(d);
      assert.equal(g.node('n1').label, 'xyz');
      assert.equal(g.node('n2').label, '123');
    });

    it('supports an implicit subgraph statement', function() {
      var d = 'digraph { x; {y; z} }';
      var g = dot.parse(d);
      assert.isTrue(g.hasNode('x'));
      assert.isTrue(g.hasNode('y'));
      assert.isTrue(g.hasNode('z'));
    });

    it('supports an explicit subgraph statement', function() {
      var d = 'digraph { x; subgraph {y; z} }';
      var g = dot.parse(d);
      assert.isTrue(g.hasNode('x'));
      assert.isTrue(g.hasNode('y'));
      assert.isTrue(g.hasNode('z'));
    });

    it('supports a subgraph as the RHS of an edge statement', function() {
      var d = 'digraph { x -> {y; z} }';
      var g = dot.parse(d);
      assert.deepEqual(g.predecessors('y'), ['x']);
      assert.deepEqual(g.predecessors('z'), ['x']);
    });

    it('supports a subgraph as the LHS of an edge statement', function() {
      var d = 'digraph { {x; y} -> {z} }';
      var g = dot.parse(d);
      assert.deepEqual(g.successors('x'), ['z']);
      assert.deepEqual(g.successors('y'), ['z']);
    });

    it('applies edge attributes to all nodes in a subgraph', function() {
      var d = 'digraph { x -> {y; z} [prop=123] }';
      var g = dot.parse(d);
      assert.equal(g.edge(g.outEdges('x', 'y')[0]).prop, 123);
      assert.equal(g.edge(g.outEdges('x', 'z')[0]).prop, 123);
    });

    it('only applies attributes in a subgraph to nodes created in that subgraph', function() {
      var d = 'digraph { x; subgraph { node [prop=123]; y; z; } }';
      var g = dot.parse(d);
      assert.isUndefined(g.node('x').prop);
      assert.equal(g.node('y').prop, 123);
      assert.equal(g.node('z').prop, 123);
    });

    it('applies parent defaults to subgraph nodes when appropriate', function() {
      var d = 'digraph { node [prop=123]; subgraph { x; subgraph { y; z [prop=456]; } } }';
      var g = dot.parse(d);
      assert.equal(g.node('x').prop, 123);
      assert.equal(g.node('y').prop, 123);
      assert.equal(g.node('z').prop, 456);
    });

    it('can handle quoted unicode', function() {
      var d = 'digraph { "♖♘♗♕♔♗♘♖" }';
      var g = dot.parse(d);
      assert.deepEqual(g.nodes(), ['♖♘♗♕♔♗♘♖']);
    });

    it('fails on unquoted unicode', function() {
      var d = 'digraph { ♖♘♗♕♔♗♘♖ }';
      assert.throws(function() { dot.parse(d); });
    });

    describe('it can parse all files in test-data', function() {
      var testDataDir = path.resolve(__dirname, 'test-data');
      fs.readdirSync(testDataDir).forEach(function(file) {
        it(file, function() {
          var f = fs.readFileSync(path.resolve(testDataDir, file), 'UTF-8');
          dot.parse(f);
        });
      });
    });
  });

  describe('it can write and parse without loss', function() {
    var testDataDir = path.resolve(__dirname, 'test-data');
    fs.readdirSync(testDataDir).forEach(function(file) {
      it(file, function() {
        var f = fs.readFileSync(path.resolve(testDataDir, file), 'UTF-8');
        var g = dot.parse(f);
        assert.deepEqual(dot.parse(dot.write(g)), g);
      });
    });
  });

  describe('parseMany', function() {
    it('fails for an empty string', function() {
      assert.throws(function() { dot.parse(''); });
    });

    it('parses a single graph', function() {
      var gs = dot.parseMany('digraph { A; B; C; A -> B }');
      assert.equal(gs.length, 1);

      var g = gs[0];
      assert.deepEqual(g.nodes().sort(), ['A', 'B', 'C']);
      assert.equal(g.outEdges('A', 'B').length, 1);
    });

    it('parses multiple graphs', function() {
      var gs = dot.parseMany('digraph { A } digraph { B }');
      assert.equal(gs.length, 2);
      assert.deepEqual(gs[0].nodes().sort(), ['A']);
      assert.deepEqual(gs[1].nodes().sort(), ['B']);
    });
  });

  describe('write', function() {
    it('escapes attr keys as needed', function() {
      var g = new DotDigraph();
      g.addNode(1, { 'this.key.needs.quotes': 'some value' });
      assert.isTrue(/\"this.key.needs.quotes\"/.test(dot.write(g)), 'key was not quoted');

      var g2 = dot.parse(dot.write(g));
      assert.property(g2.node(1), 'this.key.needs.quotes');
    });

    it('escapes attr values as needed', function() {
      var g = new DotDigraph();
      g.addNode(1, { key: 'this.val.needs.quotes' });
      assert.isTrue(/\"this.val.needs.quotes\"/.test(dot.write(g)), 'value was not quoted');

      var g2 = dot.parse(dot.write(g));
      assert.equal(g2.node(1).key, 'this.val.needs.quotes');
    });
  });
});
