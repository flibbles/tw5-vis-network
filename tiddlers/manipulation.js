/*\

Tests the Vis-Network adapter's ability to expose its manipulation features.

\*/

describe("Manipulation", function() {

var adapter;

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
	var options = adapter.output.options;
	expect(typeof options.manipulation.addNode).toBe("function");
	expect(Object.keys(options)).not.toContain("addNode");
	expect(Object.keys(options)).not.toContain("addEdge");
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
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
	options.manipulation.addNode(visNodeData, function(nodeData) {
		fail("Using the addNode callback.");
	});
	expect(onevent).toHaveBeenCalled();
});

it("can explicitly set addNode and addEdge to false", function() {
	var falseOptions = {graph: {addNode: false, addEdge: false}};
	adapter.init(element(), falseOptions);
	var keys = Object.keys(adapter.output.options);
	expect(keys).not.toContain("manipulation");
	expect(keys).not.toContain("addNode");
	expect(keys).not.toContain("addEdge");
	adapter.update(falseOptions);
	keys = Object.keys(adapter.output.options);
	expect(keys).not.toContain("manipulation");
	expect(keys).not.toContain("addNode");
	expect(keys).not.toContain("addEdge");
});

it("can have addEdge manipulation", function() {
	adapter.init(element(), {graph: {addEdge: true}, nodes: {A: {}, B: {}}});
	var options = adapter.output.options;
	expect(typeof options.manipulation.addEdge).toBe("function");
	expect(Object.keys(options)).not.toContain("addNode");
	expect(Object.keys(options)).not.toContain("addEdge");
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("addEdge");
		expect(graphEvent.objectType).toBe("graph");
		expect(variables.fromTiddler).toBe("A");
		expect(variables.toTiddler).toBe("B");
	});
	// A mock of the kind of data vis will output to the adapter. GUID and all.
	var visEdgeData = {from: "A", to: "B"};
	options.manipulation.addEdge(visEdgeData, function(edgeData) {
		fail("Using the addEdge callback.");
	});
	expect(onevent).toHaveBeenCalled();
});

it("can have deleteEdge manipulation", function(done) {
	adapter.init(element(), {graph: {}, nodes: {A: {}, B: {}}});
	var manipulation = adapter.output.options.manipulation;
	expect(manipulation).toBeUndefined();
	adapter.update({edges: {AB: {from: "A", to: "B", delete: true}}});
	// Now we update it. Even though graph isn't touched, the edge change
	// needs to update the graph.
	manipulation = adapter.output.options.manipulation;
	expect(typeof manipulation.deleteEdge).toBe("function");
	expect(manipulation.addEdge).toBe(false);
	expect(manipulation.addNode).toBe(false);
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("delete");
		expect(graphEvent.objectType).toBe("edges");
		expect(graphEvent.id).toBe("AB");
	});
	// A mock of the kind of data vis will output to the adapter. GUID and all.
	var visEdgeData = {edges: ["AB"], nodes: []};
	manipulation.deleteEdge(visEdgeData, function(edgeData) {
		// The callback must be called with empty objects so vis doesn't hang.
		expect(onevent).toHaveBeenCalled();
		expect(edgeData).toEqual({nodes: [], edges: []});
		done();
	});
});

it("can have deleteNode manipulation", function(done) {
	adapter.init(element(), {});
	var manipulation = adapter.output.options.manipulation;
	adapter.update({nodes: {A: {delete: true}}});
	// Now we update it. Even though graph isn't touched, the edge change
	// needs to update the graph.
	manipulation = adapter.output.options.manipulation;
	expect(typeof manipulation.deleteNode).toBe("function");
	expect(manipulation.addEdge).toBe(false);
	expect(manipulation.addNode).toBe(false);
	// Look at that. vis-network treats editNode differently than the others.
	// Great...
	expect(Object.keys(manipulation)).not.toContain("editNode");
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("delete");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
	});
	// A mock of the kind of data vis will output to the adapter. GUID and all.
	var visEdgeData = {edges: [], nodes: ["A"]};
	manipulation.deleteNode(visEdgeData, function(nodeData) {
		// The callback must be called with empty objects so vis doesn't hang.
		expect(onevent).toHaveBeenCalled();
		expect(nodeData).toEqual({nodes: [], edges: []});
		done();
	});
});

it("can have editNode manipulation", function(done) {
	adapter.init(element(), {});
	var manipulation = adapter.output.options.manipulation;
	adapter.update({nodes: {A: {edit: true}}});
	// Now we update it. Even though graph isn't touched, the edge change
	// needs to update the graph.
	manipulation = adapter.output.options.manipulation;
	expect(typeof manipulation.editNode).toBe("function");
	expect(manipulation.addEdge).toBe(false);
	expect(manipulation.addNode).toBe(false);
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("edit");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
	});
	// This callback returns the node object. So more than just id, but that's
	// all we'll test for here.
	var visNodeData = {id: "A"};
	manipulation.editNode(visNodeData, function(nodeData) {
		// The callback must be called with null so vis doesn't hang.
		expect(onevent).toHaveBeenCalled();
		expect(nodeData).toBeNull();
		done();
	});
});

// Deal with vis-network quirks
it("can turn editNode OFF", function() {
	adapter.init(element(), {graph: {addNode: true}, nodes: {A: {edit: true}}});
	// Now we try to turn it off,
	adapter.update({nodes: {A: {}}});
	var manipulation = adapter.output.options.manipulation;
	// This will cause vis to throw an error to the log. Unavoidable.
	// It is literally impossible to make vis turn off editNode without
	// giving it something it doesn't want.
	expect(manipulation.editNode).toBe(false);
	// And make sure if we make further changes, we don't throw any more
	// errors.
	adapter.update({graph: {addEdge: true}});
	manipulation = adapter.output.options.manipulation;
	expect(Object.keys(manipulation)).not.toContain("editNode");
});

it("can disable addObject manipulation", function() {
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

it("can toggle addEdge and deleteEdge manipulation", function() {
	var manipulation;
	adapter.init(element(), {nodes: {A: {}, B: {}}, edges: {AB: {from: "A", to: "B", delete: true}}});
	manipulation = adapter.output.options.manipulation;
	expect(manipulation.addEdge).toBe(false);
	expect(typeof manipulation.deleteEdge).toBe("function");
	adapter.update({graph: {addEdge: true}});
	manipulation = adapter.output.options.manipulation;
	expect(typeof manipulation.addEdge).toBe("function");
	expect(typeof manipulation.deleteEdge).toBe("function");
	adapter.update({edges: {AB: {from: "A", to: "B"}}});
	manipulation = adapter.output.options.manipulation;
	expect(typeof manipulation.addEdge).toBe("function");
	expect(manipulation.deleteEdge).toBe(false);
});

});
