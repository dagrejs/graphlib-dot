var expect = require("./chai").expect;
var readMany = require("..").readMany;

describe("readMany", () => {
  it("can read multiple graphs", () => {
    var gs = readMany("digraph {} graph {}");
    expect(gs).to.have.length(2);
    expect(gs[0].isDirected()).to.be.true;
    expect(gs[1].isDirected()).to.be.false;
  });
});

