/*\

Tests the Vis-Network adapter's ability to expose its layout features.

\*/

describe("Layout", function() {

var adapter;

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can have no layout", function() {
	adapter.init(element(), {graph: {}});
	expect(adapter.output.options.layout).toBeUndefined();
});

it("can enable and disable hierarchy", function() {
	adapter.init(element(), {graph: {hierarchy: true}});
	expect(adapter.output.options.layout).not.toBeUndefined();
	expect(adapter.output.options.layout.hierarchical).not.toBe(false);
	// This line here may have to change
	expect(adapter.output.options.layout.hierarchical).toBe(true);
	adapter.update({graph: {hierarchy: false}});
	expect(adapter.output.options).toEqual({layout: {hierarchical: false}});
	adapter.update({graph: {hierarchy: true}});
	expect(adapter.output.options.layout.hierarchical).not.toBe(false);
	// Now we try removing its configuration altogether. Should result in
	// no hierarchy.
	adapter.update({graph: {}});
	expect(adapter.output.options).toEqual({layout: {hierarchical: false}});
	// ...And turn it back on again
	adapter.update({graph: {hierarchy: true}});
	expect(adapter.output.options.layout.hierarchical).not.toBe(false);
});

it("can set hierarchy direction", function() {
	adapter.init(element(), {graph: {hierarchy: true, hierarchyDirection: "LR"}});
	expect(adapter.output.options.layout).toEqual({hierarchical: {direction: "LR"}});
	expect(adapter.output.options).not.toContain("hierarchy");
	expect(adapter.output.options).not.toContain("hierarchyDirection");
});

it("hierarchy settings ignored if hierarchy is off", function() {
	adapter.init(element(), {graph: {hierarchy: false, hierarchyDirection: "LR"}});
	expect(adapter.output.options.layout).toEqual({hierarchical: false});
	adapter.update({graph: {hierarchy: false, hierarchyDirection: "RL"}});
	expect(adapter.output.options.layout).toEqual({hierarchical: false});
});

});
