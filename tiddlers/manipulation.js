/*\

Tests the Vis-Network adapter's ability to expose its manipulation features.

\*/

describe("Manipulation", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can have no manipulation", function() {
	adapter.init(element(), {graph: {}});
	expect(adapter.output.options.manipulation).toBeUndefined();
});

it("can have addNode manipulation", function() {
	adapter.init(element(), {graph: {addNode: true}, nodes: {A: {}}});
	var manipulation = adapter.output.options.manipulation;
	expect(typeof manipulation.addNode).toBe("function");
	var onevent = spyOn(adapter, "onevent").and.callFake(function(graphEvent, variables) {
		expect(graphEvent.type).toBe("addNode");
		expect(graphEvent.objectType).toBe("graph");
		// We round the numbers to the nearest tenth so they're not so big
		// in the wizard, or whever we record them. Accuracy past that point
		// is pointless anyway.
		expect(variables.x).toBe(34.3);
		expect(variables.y).toBe(18);
	});
	// A mock of the kind of data vis will output to the adapter. GUID and all.
	var visNodeData = {id: "12345678-abcd-123456", x: 34.345, y: 17.987, label: "new"};
	manipulation.addNode(visNodeData, function(nodeData) {
		fail("Using the addNode callback.");
	});
	expect(onevent).toHaveBeenCalled();
});

it("can have addEdge manipulation", function() {
	adapter.init(element(), {graph: {addEdge: true}, nodes: {A: {}, B: {}}});
	var manipulation = adapter.output.options.manipulation;
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

it("can have deleteEdge manipulation", function() {
	adapter.init(element(), {graph: {}, nodes: {A: {}, B: {}}});
	var manipulation = adapter.output.options.manipulation;
	expect(manipulation).toBeUndefined();
	adapter.update({edges: {AB: {from: "A", to: "B", delete: true}}});
	// Now we update it. Even though graph isn't touched, the edge change
	// needs to update the graph.
	manipulation = adapter.output.options.manipulation;
	expect(typeof manipulation.deleteEdge).toBe("function");
	var onevent = spyOn(adapter, "onevent").and.callFake(function(graphEvent, variables) {
		expect(graphEvent.type).toBe("delete");
		expect(graphEvent.objectType).toBe("edges");
		expect(graphEvent.id).toBe("AB");
	});
	// A mock of the kind of data vis will output to the adapter. GUID and all.
	var visEdgeData = {edges: ["AB"], nodes: []};
	manipulation.deleteEdge(visEdgeData, function(edgeData) {
		fail("Using the addEdge callback.");
	});
	expect(onevent).toHaveBeenCalled();
});


it("can disable existing manipulation", function() {
	adapter.init(element(), {graph: {addEdge: true, addNode: true}});
	var manipulation = adapter.output.options.manipulation;
	expect(typeof manipulation.addNode).toBe("function");
	expect(typeof manipulation.addEdge).toBe("function");
	// Partially disable it
	adapter.update({graph: {addEdge: true}});
	manipulation = adapter.output.options.manipulation;
	expect(manipulation.addNode).toBe(false);
	expect(typeof manipulation.addEdge).toBe("function");
	// Fully disable it
	adapter.update({graph: {}});
	manipulation = adapter.output.options.manipulation;
	expect(manipulation).toBe(false);
});

});
