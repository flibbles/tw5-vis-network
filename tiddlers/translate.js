/*\

Tests the Vis-Network adapter's ability to translate incoming properties.

\*/

var Adapter = $tw.modules.getModulesByTypeAsHashmap("graphengine")["Vis-Network"];
var translate = Adapter.translate;

var network;
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
	adapter.init({childNodes: []}, {
		nodes: {A: {label: "A"}},
		edges: {1: {label: "1"}}});
	var objects = MockVis.network.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A", label: "A"}});
	expect(objects.edges.entries).toEqual({1: {id: "1", label: "1"}});
	expect(objects.nodes.options).toEqual({queue: true});
	expect(objects.edges.options).toEqual({queue: true});
});

it("can update nodes", function() {
	var adapter = Object.create(Adapter);
	adapter.init({childNodes: []}, {
		nodes: {A: {}, B: {}, C: {}}});
	adapter.update({nodes: {
		B: {label: "new"},
		C: null,
		D: {}
	}});
	expect(MockVis.network.objects.nodes.entries).toEqual({A: {id: "A"}, B: {id: "B", label: "new"}, D: {id: "D"}});
});

});
