/*\

Tests the Vis-Network adapter's ability to configure physics.

\*/

var MockVis = require("./mock/vis");
var adapter;

var solver = "barnesHut";

describe("Physics", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can enable and disable physics", function() {
	adapter.init(element(), {graph: {physics: true}});
	var physics = adapter.output.options.physics;
	expect(Object.keys(physics)).toEqual(["enabled", solver, "solver"]);
	expect(physics.enabled).toBe(true);
	var barnesHut = physics.barnesHut;
	adapter.update({graph: {physics: false}});
	expect(adapter.output.options.physics).toEqual({enabled: false, barnesHut: barnesHut, solver: solver});
	adapter.update({graph: {}});
	expect(adapter.output.options.physics).toEqual({enabled: true, barnesHut: barnesHut, solver: solver});
});

it("maintains current physics if manipulation recreates graph options", function() {
	adapter.init(element(), {graph: {physics: true, maxVelocity: 20}});
	adapter.update({nodes: {A: {delete: true}}});
	var physics = adapter.output.options.physics;
	expect(physics).toEqual({enabled: true, [solver]: physics[solver], maxVelocity: 20, solver: solver});
});

it("ignores maxVelocity if physics is disabled", function() {
	adapter.init(element(), {graph: {physics: false, maxVelocity: 20}});
	expect(adapter.output.options.physics.enabled).toBe(false);
	expect(Object.keys(adapter.output.options)).not.toContain("maxVelocity");
});

it("can set and unset spring constant", function() {
	adapter.init(element(), {graph: {springConstant: 0.055, springLength: 15}});
	var physics = adapter.output.options.physics;
	expect(physics.barnesHut.springConstant).toBe(0.055);
	expect(physics.barnesHut.springLength).toBe(15);
	// This is a default, making sure that the defaults are loading.
	expect(physics.barnesHut.theta).toBe(0.5);
	adapter.update({graph: {springLength: 15}});
	physics = adapter.output.options.physics;
	expect(physics.enabled).toBe(true);
	// Both should be back to defaults
	expect(physics.barnesHut.springConstant).toBe(0.04);
	expect(physics.barnesHut.springLength).toBe(15);
	expect(physics.barnesHut.theta).toBe(0.5);
});

});
