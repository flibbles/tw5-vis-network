/*\

Tests the Vis-Network edges properties

\*/

var adapter;

describe("Edges", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

/*** Smooth ***/

it("smooth sees no as false", function() {
	adapter.init(element(), {
		nodes: {A: {}, B: {}, C: {}},
		edges: {
			AB: {from: "A", to: "B", smooth: "no"},
			AC: {from: "A", to: "C"}}});
	expect(adapter.output.objects.edges.entries).toEqual({
		AB: {id: "AB", from: "A", to: "B", smooth: {enabled: false, type: {}}},
		AC: {id: "AC", from: "A", to: "C"}});
});

it("smooth returns to dynamic as default", function() {
	adapter.init(element(), {
		nodes: {A: {}, B: {}},
		edges: { AB: {from: "A", to: "B", smooth: "no"}}});
	expect(adapter.output.objects.edges.entries).toEqual({
		AB: {id: "AB", from: "A", to: "B", smooth: {enabled: false, type: {}}}});
	adapter.update({ edges: { AB: {from: "A", to: "B"}}});
	expect(adapter.output.objects.edges.entries).toEqual({
		AB: {id: "AB", from: "A", to: "B", smooth: {enabled: true, type: "dynamic"}}});
});

it("smooth transitions to dynamic from none", function() {
	adapter.init(element(), {
		nodes: {A: {}, B: {}},
		edges: { AB: {from: "A", to: "B", smooth: "no"}}});
	expect(adapter.output.objects.edges.entries).toEqual({
		AB: {id: "AB", from: "A", to: "B", smooth: {enabled: false, type: {}}}});
	adapter.update({ edges: { AB: {from: "A", to: "B", smooth: "dynamic"}}});
	expect(adapter.output.objects.edges.entries).toEqual({
		AB: {id: "AB", from: "A", to: "B", smooth: {enabled: true, type: "dynamic"}}});
});

// Test for https://github.com/flibbles/tw5-graph/issues/33
it("smooth handles vis-network bug w/ hierarchy and smooth edges", function() {
	adapter.init(element(), {
		graph: {hierarchy: true},
		nodes: {A: {}, B: {}, C: {}},
		edges: {
			// One to go from explicit no to unset
			AB: {from: "A", to: "B", smooth: "no"},
			// One to go from explicit yes to unset
			AC: {from: "A", to: "C", smooth: "dynamic"},
			// One to go from explicit yes to explicit no
			BC: {from: "B", to: "C", smooth: "dynamic"}}});
	adapter.update({edges: {
		AB: {from: "A", to: "B"},
		AC: {from: "A", to: "C"},
		BC: {from: "B", to: "C", smooth: "no"}}});
	// Once set, it must always remain set
	expect(adapter.output.objects.edges.entries).toEqual({
		AB: {id: "AB", from: "A", to: "B", smooth: {enabled: true, type: "dynamic"}},
		AC: {id: "AC", from: "A", to: "C", smooth: {enabled: true, type: "dynamic"}},
		BC: {id: "BC", from: "B", to: "C", smooth: {enabled: false, type: {}}}});
});

});
