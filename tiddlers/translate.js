/*\

Tests the Vis-Network adapter's ability to translate incoming properties.

\*/

var Adapter = $tw.modules.getModulesByTypeAsHashmap("graphengine")["Vis-Network"];
var MockVis = require("./mock/vis");

describe("Adapter", function() {

beforeAll(function() {
	Adapter.oldVis = Adapter.Vis;
	Adapter.Vis = MockVis;
});

afterAll(function() {
	Adapter.Vis = Adapter.oldVis;
});

it("initializes with starting data", function() {
	var adapter = Object.create(Adapter);
	var update = spyOn(MockVis.DataSet.prototype, "update");
	var add = spyOn(MockVis.DataSet.prototype, "add");
	var flush = spyOn(MockVis.DataSet.prototype, "flush");
	adapter.init({childNodes: []}, {
		nodes: {A: {label: "A"}},
		edges: {1: {label: "1"}}});
	var objects = MockVis.network.objects;
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
	var adapter = Object.create(Adapter);
	var flush = spyOn(MockVis.DataSet.prototype, "flush").and.callThrough();
	adapter.init({childNodes: []}, {
		nodes: {A: {}, B: {}, C: {}}});
	adapter.update({nodes: {
		B: {label: "new"},
		C: null,
		D: {}
	}});
	expect(MockVis.network.objects.nodes.entries).toEqual({A: {id: "A"}, B: {id: "B", label: "new"}, D: {id: "D"}});
	expect(flush).toHaveBeenCalled();
});

it("does not retain lingering properties", function() {
	var adapter = Object.create(Adapter);
	adapter.init({childNodes: []}, {nodes: {A: {label: "old", size: 2, physics: true}}});
	// Setting physics to false makes sure the falsy value doesn't get picked
	// up as having been removed.
	adapter.update({nodes: {A: {size: 5, physics: false}}});
	var objects = MockVis.network.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A", size: 5, label: null, physics: false}});
});

it("initializes with global style", function() {
	var adapter = Object.create(Adapter);
	adapter.init({childNodes: []}, {graph: {
		nodeBackground: "#ffffff",
		nodeForeground: "#000000"}});
	var options = MockVis.network.options;
	expect(options.nodes.color).toBe("#ffffff");
	expect(options.nodes.font.color).toBe("#000000");
});

it("can update graph properties", function() {
	var adapter = Object.create(Adapter);
	adapter.init({childNodes: []}, {});
	adapter.update({graph: {physics: false}});
	var options = MockVis.network.options;
	expect(options.physics.enabled).toBe(false);
});

/*** Property translation ***/

it("translates graph properties", function() {
	var adapter = Object.create(Adapter);
	adapter.init({childNodes: []}, {graph: {physics: true}});
	var options = MockVis.network.options;
	expect(options.physics.enabled).toBe(true);
});

it("translate ", function() {
	function testNode(input, expected) {
		var adapter = Object.create(Adapter);
		adapter.init({childNodes: []}, {nodes: input});
		expect(MockVis.network.objects.nodes.entries).toEqual(expected);
	};
	// This is the only one currently
	testNode({A: {color: "#ff0000"}}, {A: {id: "A", color: "#ff0000"}});
});

});
