/*\

Tests the Vis-Network adapter's ability to auto-select font colors for labels
inside nodes.

\*/

var adapter;

describe("Defaults", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("will set defaults with other graph input", function() {
	adapter.init(element(), {graph: {something: "irrelevant"}});
	var options = adapter.output.options;
	expect(options).toEqual({
		interaction: {hover: true},
		nodes: {shape: "dot", font: {}},
		edges: {arrows: "to"},
		something: "irrelevant"});
});

it("will set defaults with no graph input", function() {
	adapter.init(element(), {});
	var options = adapter.output.options;
	expect(options).toEqual({
		interaction: {hover: true},
		nodes: {shape: "dot", font: {}},
		edges: {arrows: "to"}});
});

});
