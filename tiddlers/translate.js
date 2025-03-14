/*\

Tests the Vis-Network adapter's ability to translate incoming properties.

\*/

var Adapter = $tw.modules.getModulesByTypeAsHashmap("graphengine")["Vis-Network"];
var MockVis = require("./mock/vis");
var adapter;

describe("Adapter", function() {

beforeAll(function() {
	Adapter.oldVis = Adapter.Vis;
	Adapter.Vis = MockVis;
});

afterAll(function() {
	Adapter.Vis = Adapter.oldVis;
});

beforeEach(function() {
	adapter = Object.create(Adapter);
	adapter.onevent = function() {
		fail("Event called without spy.");
	};
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
	var flush = spyOn(MockVis.DataSet.prototype, "flush").and.callThrough();
	adapter.init(element(), {
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
	adapter.init(element(), {nodes: {A: {label: "old", size: 2, physics: true}}});
	// Setting physics to false makes sure the falsy value doesn't get picked
	// up as having been removed.
	adapter.update({nodes: {A: {size: 5, physics: false}}});
	var objects = MockVis.network.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A", size: 5, label: null, physics: false}});
});

it("initializes with global style", function() {
	adapter.init(element(), {graph: {
		nodeColor: "#ffffff",
		fontColor: "#000000"}});
	var options = MockVis.network.options;
	expect(options.nodes.color).toBe("#ffffff");
	expect(options.nodes.font.color).toBe("#000000");
});

it("can update graph properties", function() {
	adapter.init(element(), {});
	adapter.update({graph: {physics: false}});
	var options = MockVis.network.options;
	expect(options.physics.enabled).toBe(false);
});

/*** Property translation ***/

it("translates graph properties", function() {
	adapter.init(element(), {graph: {physics: true}});
	var options = MockVis.network.options;
	expect(options.physics.enabled).toBe(true);
});

it("translate ", function() {
	function testNode(input, expected) {
		adapter.init(element(), {nodes: input});
		expect(MockVis.network.objects.nodes.entries).toEqual(expected);
	};
	// This is the only one currently
	testNode({A: {color: "#ff0000"}}, {A: {id: "A", color: "#ff0000"}});
});

// This is to cope with a bug vis-network has where edge labels can't be removed from existing edges.
it("can remove labels from edges", function() {
	adapter.init(element(), {nodes: {A: {label: "anything"}, B: {}}, edges: {1: {from: "A", to: "B", label: "anything"}}});
	adapter.update({nodes: {A: {}}, edges: {1: {from: "A", to: "B"}}});
	expect(MockVis.network.objects.nodes.entries).toEqual({A: {id: "A", label: null}, B: {id: "B"}});
	expect(MockVis.network.objects.edges.entries).toEqual({1: {id: "1", from: "A", to: "B", label: "\0"}});
});

/*** Auto fontColor contrast ***/

it("will assign contrasting colors when labels are inside node", function() {
	var darkFont = {color: "#000000"};
	var lightFont = {color: "#ffffff"};
	adapter.init(element(), {graph: {nodeColor: "#111111", fontColor: "#eeeeee"}, nodes: {
		dot1: {label: "label", shape: "dot", color: "#000000"},
		dot2: {label: "label", shape: "dot", color: "#ffffff"},
		dot3: {label: "label", shape: "dot"},
		box1: {label: "label", shape: "box", color: "#000000"},
		box2: {label: "label", shape: "box", color: "#ffffff"},
		box3: {label: "label", shape: "box"},
		// emp as in empty. No label
		emp1: {shape: "box", color: "#000000"},
		emp2: {shape: "box", color: "#ffffff"},
		emp3: {shape: "box"},
		font1: {label: "label", shape: "box", fontColor: "#333333", color: "#000000"},
		font2: {label: "label", shape: "box", fontColor: "#333333", color: "#ffffff"},
		font3: {label: "label", shape: "box", fontColor: "#333333"}
	}});
	expect(MockVis.network.objects.nodes.entries).toEqual({
		dot1: {id: "dot1", label: "label", shape: "dot", color: "#000000"},
		dot2: {id: "dot2", label: "label", shape: "dot", color: "#ffffff"},
		dot3: {id: "dot3", label: "label", shape: "dot"},
		box1: {id: "box1", label: "label", shape: "box", color: "#000000", font: lightFont},
		box2: {id: "box2", label: "label", shape: "box", color: "#ffffff", font: darkFont},
		box3: {id: "box3", label: "label", shape: "box", font: lightFont},
		emp1: {id: "emp1", shape: "box", color: "#000000"},
		emp2: {id: "emp2", shape: "box", color: "#ffffff"},
		emp3: {id: "emp3", shape: "box"},
		font1: {id: "font1", label: "label", shape: "box", color: "#000000", font: {color: "#333333"}},
		font2: {id: "font2", label: "label", shape: "box", color: "#ffffff", font: {color: "#333333"}},
		font3: {id: "font3", label: "label", shape: "box", font: {color: "#333333"}}
	});
});

it("will not assign contrasting font colors with no background", function() {
	adapter.init(element(), {nodes: {
		blank: {label: "label", shape: "box"},
		dark: {label: "label", shape: "box", color: "#000000"}
	}});
	expect(MockVis.network.objects.nodes.entries).toEqual({
		blank: {id: "blank", label: "label", shape: "box"},
		dark: {id: "dark", label: "label", shape: "box", color: "#000000", font: {color: "#ffffff"}}
	});
});

it("can remove default contrasting font colors", function() {
	adapter.init(element(), {nodes: {
		A: {shape: "box", color: "#000000", label: "label"}}});
	adapter.update({nodes: {
		A: {shape: "box", color: "#000000"}}});
	var objects = MockVis.network.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A", label: null, shape: "box", color: "#000000", font: null}});
});

/*** Manipulation ***/

it("can have no manipulation", function() {
	adapter.init(element(), {graph: {}});
	expect(MockVis.network.options.manipulation).toBe(false);
});

it("can have addNode manipulation", function() {
	adapter.init(element(), {graph: {addNode: true}, nodes: {A: {}}});
	var manipulation = MockVis.network.options.manipulation;
	expect(typeof manipulation.addNode).toBe("function");
	var onevent = spyOn(adapter, "onevent").and.callFake(function(graphEvent, variables) {
		expect(graphEvent.type).toBe("addNode");
		expect(graphEvent.objectType).toBe("graph");
		expect(variables.x).toBe(34);
		expect(variables.y).toBe(17);
	});
	// A mock of the kind of data vis will output to the adapter. GUID and all.
	var visNodeData = {id: "12345678-abcd-123456", x: 34, y: 17, label: "new"};
	manipulation.addNode(visNodeData, function(nodeData) {
		fail("Using the addNode callback.");
	});
	expect(onevent).toHaveBeenCalled();
});

it("can have addEdge manipulation", function() {
	adapter.init(element(), {graph: {addEdge: true}, nodes: {A: {}, B: {}}});
	var manipulation = MockVis.network.options.manipulation;
	expect(typeof manipulation.addEdge).toBe("function");
	var onevent = spyOn(adapter, "onevent").and.callFake(function(graphEvent, variables) {
		expect(graphEvent.type).toBe("addEdge");
		expect(graphEvent.objectType).toBe("graph");
		expect(variables.fromTiddler).toBe("A");
		expect(variables.toTiddler).toBe("B");
	});
	// A mock of the kind of data vis will output to the adapter. GUID and all.
	var visEdgeData = {from: "A", to: "B"};
	manipulation.addEdge(visEdgeData, function(edgeData) {
		fail("Using the addEdge callback.");
	});
	expect(onevent).toHaveBeenCalled();
});

it("can disable existing manipulation", function() {
	adapter.init(element(), {graph: {addEdge: true, addNode: true}});
	var manipulation = MockVis.network.options.manipulation;
	expect(typeof manipulation.addNode).toBe("function");
	expect(typeof manipulation.addEdge).toBe("function");
	// Partially disable it
	adapter.update({graph: {addEdge: true}});
	manipulation = MockVis.network.options.manipulation;
	expect(manipulation.addNode).toBe(false);
	expect(typeof manipulation.addEdge).toBe("function");
	// Fully disable it
	adapter.update({graph: {}});
	manipulation = MockVis.network.options.manipulation;
	expect(manipulation).toBe(false);
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
