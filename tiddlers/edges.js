/*\

Tests the Vis-Network edges properties

\*/

var adapter;

describe("Events", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

// Test for https://github.com/flibbles/tw5-graph/issues/33
it("", function() {
	adapter.init(element(), {
		graph: {hierarchy: true},
		nodes: {A: {}, B: {}, C: {}},
		edges: {
			AB: {from: "A", to: "B", smooth: false},
			AC: {from: "A", to: "C", smooth: true}}});
	adapter.update({edges: {
		AB: {from: "A", to: "B"},
		AC: {from: "A", to: "C"}}});
	expect(adapter.output.objects.edges.entries).toEqual({
		AB: {id: "AB", from: "A", to: "B", smooth: false},
		AC: {id: "AC", from: "A", to: "C", smooth: false}});
});

});
