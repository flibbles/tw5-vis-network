/*\

Tests the Vis-Network node properties

\*/

var adapter;

describe("Nodes", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("min and max widths", function() {
	adapter.init(element(), { nodes: {
		none: {},
		min: {minWidth: 0.5},
		max: {maxWidth: 2.5},
		// Mins larger than maxes is allowed, and has defined behavior
		both: {minWidth: 100, maxWidth: 10}}});
	expect(adapter.output.objects.nodes.entries).toEqual({
		none: {id: "none"},
		min: {id: "min", widthConstraint: {minimum: 0.5}},
		max: {id: "max", widthConstraint: {maximum: 2.5}},
		both: {id: "both", widthConstraint: {minimum: 100, maximum: 10}}});
	adapter.update({ nodes: {
		both: {}}});
	expect(adapter.output.objects.nodes.entries).toEqual({
		none: {id: "none"},
		min: {id: "min", widthConstraint: {minimum: 0.5}},
		max: {id: "max", widthConstraint: {maximum: 2.5}},
		both: {id: "both", widthConstraint: null}});
});

});
