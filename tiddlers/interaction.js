/*\

Tests the Vis-Network adapter's ability to expose its interaction features.

\*/

describe("Interaction", function() {

var adapter;

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can have no interaction", function() {
	adapter.init(element(), {graph: {}});
	var defaults = adapter.output.options.interaction;
	var expected = Object.assign({zoomView: false}, defaults);
	adapter.init(element(), {graph: {zoom: false}})
	expect(adapter.output.options.interaction).toEqual(expected);
});

it("can add interaction and not conflict with defaults", function() {
	adapter.init(element(), {graph: {}});
	adapter.update({graph: {}});
	expect(adapter.output.options.interaction).toBeUndefined();
});

it("can enable and disable zoom", function() {
	adapter.init(element(), {graph: {zoom: true}});
	expect(adapter.output.options.interaction.zoomView).toBe(true);
	expect(adapter.output.options.zoom).not.toBeDefined();
	// Now turn it off
	adapter.update({graph: {zoom: false}});
	expect(adapter.output.options).toEqual({interaction: {zoomView: false}});
	// Now unset it. It should go back to being true
	adapter.update({graph: {}});
	expect(adapter.output.options).toEqual({interaction: {zoomView: true}});
});

});
