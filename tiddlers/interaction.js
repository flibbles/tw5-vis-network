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
	adapter.update({graph: {navigation: true}});
	// We also set navigation to make sure we can still set other things...
	expect(adapter.output.options).toEqual({interaction: {navigationButtons: true, zoomView: true}});
});

it("can alter and unset zoomSpeed", function() {
	adapter.init(element(), {graph: {zoom: true, zoomSpeed: 4}});
	expect(adapter.output.options.interaction.zoomView).toBe(true);
	expect(adapter.output.options.zoom).toBeUndefined();
	expect(adapter.output.options.zoomSpeed).toBeUndefined();
	// Now turn it off
	adapter.update({graph: {zoom: true}});
	expect(adapter.output.options).toEqual({interaction: {zoomView: true, zoomSpeed: 1}});
});

it("can enable and disable navigation", function() {
	adapter.init(element(), {graph: {navigation: true}});
	expect(adapter.output.options.interaction.navigationButtons).toBe(true);
	expect(adapter.output.options.navigation).not.toBeDefined();
	// Now turn it off
	adapter.update({graph: {navigation: false}});
	expect(adapter.output.options).toEqual({interaction: {navigationButtons: false}});
});

it("can enable and unset navigation", function() {
	adapter.init(element(), {graph: {navigation: true}});
	expect(adapter.output.options.interaction.navigationButtons).toBe(true);
	expect(adapter.output.options.navigation).not.toBeDefined();
	// Now unset it
	adapter.update({graph: {zoom: false}});
	// We also set zoom to make sure we can still set other things...
	expect(adapter.output.options).toEqual({interaction: {zoomView: false, navigationButtons: false}});
});

});
