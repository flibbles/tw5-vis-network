/*\

Tests the Vis-Network adapter's ability to configure physics.

\*/

var MockVis = require("./mock/vis");
var adapter;

describe("Physics", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can enable and disable physics", function() {
	adapter.init(element(), {graph: {physics: true}});
	expect(adapter.output.options.physics).toEqual({enabled: true});
	adapter.update({graph: {physics: false}});
	expect(adapter.output.options.physics).toEqual({enabled: false});
	adapter.update({graph: {}});
	expect(adapter.output.options.physics).toEqual({enabled: true});
});

it("maintains current physics if manipulation recreates graph options", function() {
	adapter.init(element(), {graph: {physics: true, maxVelocity: 20}});
	adapter.update({nodes: {A: {delete: true}}});
	expect(adapter.output.options.physics).toEqual({enabled: true, maxVelocity: 20});
});

it("ignores maxVelocity if physics is disabled", function() {
	adapter.init(element(), {graph: {physics: false, maxVelocity: 20}});
	expect(adapter.output.options.physics).toEqual({enabled: false});
	expect(Object.keys(adapter.output.options)).not.toContain("maxVelocity");
});

it("can set and unset spring constant", function() {
	adapter.init(element(), {graph: {springConstant: 0.055}});
	expect(adapter.output.options.physics).toEqual({barnesHut: {springConstant: 0.055}});
	adapter.update({graph: {}});
	expect(adapter.output.options.physics).toEqual({enabled: true});
});

});
