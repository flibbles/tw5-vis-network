/*\

Tests the Vis-Network adapter's ability to translate incoming properties.

\*/

var MockVis = require("./mock/vis");
var adapter;

describe("Adapter", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("initializes with starting data", function() {
	var update = spyOn(MockVis.DataSet.prototype, "update");
	var add = spyOn(MockVis.DataSet.prototype, "add");
	var flush = spyOn(MockVis.DataSet.prototype, "flush");
	adapter.init(element(), {
		nodes: {A: {label: "A"}},
		edges: {1: {label: "1"}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A", label: "A"}});
	expect(objects.edges.entries).toEqual({1: {id: "1", label: "1"}});
	expect(objects.nodes.options).toEqual({queue: true});
	expect(objects.edges.options).toEqual({queue: true});
	// These shouldn't be called during initialization. It'll result in
	// unnecessary rendering. I think.
	expect(update).not.toHaveBeenCalled();
	expect(add).not.toHaveBeenCalled();
	expect(flush).not.toHaveBeenCalled();
});

it("can update nodes", function() {
	var flush = spyOn(MockVis.DataSet.prototype, "flush").and.callThrough();
	adapter.init(element(), {
		nodes: {A: {}, B: {}, C: {}}});
	adapter.update({nodes: {
		B: {label: "new"},
		C: null,
		D: {}
	}});
	expect(adapter.output.objects.nodes.entries).toEqual({A: {id: "A"}, B: {id: "B", label: "new"}, D: {id: "D"}});
	expect(flush).toHaveBeenCalled();
});

it("does not retain lingering properties", function() {
	adapter.init(element(), {nodes: {A: {label: "old", size: 2, physics: true}}});
	// Setting physics to false makes sure the falsy value doesn't get picked
	// up as having been removed.
	adapter.update({nodes: {A: {size: 5, physics: false}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A", size: 5, label: null, physics: false}});
});

it("initializes with global style", function() {
	adapter.init(element(), {graph: {
		nodeColor: "#ffffff",
		fontColor: "#000000"}});
	var options = adapter.output.options;
	expect(options.nodes.color).toBe("#ffffff");
	expect(options.nodes.font.color).toBe("#000000");
});

it("can update graph properties", function() {
	adapter.init(element(), {});
	adapter.update({graph: {physics: false}});
	var options = adapter.output.options;
	expect(options.physics.enabled).toBe(false);
});

/*** Property translation ***/

it("translates graph properties", function() {
	adapter.init(element(), {graph: {physics: true}});
	var options = adapter.output.options;
	expect(options.physics.enabled).toBe(true);
});

it("translate ", function() {
	function testNode(input, expected) {
		adapter.init(element(), {nodes: input});
		expect(adapter.output.objects.nodes.entries).toEqual(expected);
	};
	// This is the only one currently
	testNode({A: {color: "#ff0000"}}, {A: {id: "A", color: "#ff0000"}});
});

// This is to cope with a bug vis-network has where edge labels can't be removed from existing edges.
it("can remove labels from edges", function() {
	adapter.init(element(), {nodes: {A: {label: "anything"}, B: {}}, edges: {1: {from: "A", to: "B", label: "anything"}}});
	adapter.update({nodes: {A: {}}, edges: {1: {from: "A", to: "B"}}});
	expect(adapter.output.objects.nodes.entries).toEqual({A: {id: "A", label: null}, B: {id: "B"}});
	expect(adapter.output.objects.edges.entries).toEqual({1: {id: "1", from: "A", to: "B", label: "\0"}});
});

/*** Default graph values ***/

it("will set defaults with other graph input", function() {
	adapter.init(element(), {graph: {something: "irrelevant"}});
	var options = adapter.output.options;
	expect(options).toEqual({
		interaction: {hover: true},
		nodes: {shape: "dot", font: {}},
		something: "irrelevant"});
});

it("will set defaults with no graph input", function() {
	adapter.init(element(), {});
	var options = adapter.output.options;
	expect(options).toEqual({
		interaction: {hover: true},
		nodes: {shape: "dot", font: {}}});
});

/*** Handling of non-graph DOM nodes ***/

it("puts pre-existing DOM nodes after canvas", function() {
	var outer = element();
	var inner1 = $tw.fakeDocument.createElement("span");
	var inner2 = $tw.fakeDocument.createElement("span");
	inner1.attributes.id = "inner1";
	inner2.attributes.id = "inner2";
	outer.appendChild(inner1);
	outer.appendChild(inner2);
	adapter.init(outer, {});
	var length = outer.childNodes.length;
	expect(length).toBe(3);
	expect(outer.childNodes[1].attributes.id).toBe("inner1");
	expect(outer.childNodes[2].attributes.id).toBe("inner2");
});

});
