var fs = require('fs'),
    assert = require('chai').assert,
    version = require('..').version;

describe('version', function() {
  it('matches the value in package.json', function() {
    var packageJson = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
    assert.equal(version, packageJson.version);
  });
});
