/*\

Tests the Vis-Network standard events.

\*/

var MockVis = require("./mock/vis");
var adapter;
var dbclick = "doubleclick";

describe("Events", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

// TODO: Test all the other basic events too, like hover, blur, drag, etc...

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can do doubleclick for graphs", function() {
	adapter.init(element(), {graph: {[dbclick]: true}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe(dbclick);
		expect(graphEvent.objectType).toBe("graph");
		expect(graphEvent.event.ctrlKey).toBe(true);
		// It rounds to nice numbers
		// We're not exposing the DOM locations at this time. We might later.
		expect(variables).toEqual({x: 1002.3, y: 1008/*, xView: 2, yView: 7*/});
	});
	var pointerUp = {type: "pointerup", ctrlKey: true};
	var visEventData = {
		edges: [],
		event: {pointerType: "mouse", type: "doubletap", pointers: [pointerUp]},
		nodes: [],
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002.3456, y: 1007.9876} } };
	adapter.output.testEvent("doubleClick", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
	expect(Object.keys(adapter.output.options)).not.toContain(dbclick);
});

it("can do actions for nodes", function() {
	adapter.init(element(), {nodes: {A: {actions: true}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("actions");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
		expect(graphEvent.event.ctrlKey).toBe(true);
		// Variables are stripped down for simplicity for now
		expect(variables).toBeUndefined();
		//expect(variables).toEqual({x: 1002, y: 1007, xView: 2, yView: 7});
	});
	// Emulating the sort of data vis sends us. We have the ctrl button held.
	var pointerUp = {type: "pointerup", ctrlKey: true};
	var visEventData = {
		edges: [],
		event: {pointerType: "mouse", type: "doubletap", pointers: [pointerUp]},
		nodes: ["A"],
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002, y: 1007} } };
	adapter.output.testEvent("doubleClick", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("can do actions for edges", function() {
	adapter.init(element(), {nodes: {A: {}, B: {}}, edges: {AB: {from: "A", to: "B", actions: true}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("actions");
		expect(graphEvent.objectType).toBe("edges");
		expect(graphEvent.id).toBe("AB");
		// Variables are stripped down for simplicity for now
		expect(variables).toBeUndefined();
		//expect(variables).toEqual({x: 1002, y: 1007, xView: 2, yView: 7});
	});
	var pointerUp = {type: "pointerup", ctrlKey: true};
	var visEventData = {
		edges: ["AB"],
		event: {pointerType: "mouse", type: "doubletap", pointers: [pointerUp]},
		nodes: [],
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002, y: 1007} } };
	adapter.output.testEvent("doubleClick", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

/*** Hover and blur event (when the mouse moves over a node) ***/

it("can process a node 'hover' event", function() {
	adapter.init(element(), {nodes: {A: {hover: true}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("hover");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
		expect(graphEvent.event.ctrlKey).toBe(true);
		expect(variables).toEqual({x: 1002, y: 1007/*, xView: 2, yView: 7*/});
	});
	// Emulating the sort of data vis sends us. We have the ctrl button held.
	var mousemove = {type: "mousemove", ctrlKey: true};
	var visEventData = {
		event: mousemove,
		node: "A",
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002, y: 1007} } };
	adapter.output.testEvent("hoverNode", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("can process a node 'blur' event", function() {
	adapter.init(element(), {nodes: {A: {hover: true}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("blur");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
		expect(graphEvent.event.ctrlKey).toBe(true);
		expect(variables).toEqual({});
	});
	// Emulating the sort of data vis sends us. We have the ctrl button held.
	var mousemove = {type: "mousemove", ctrlKey: true};
	var visEventData = {
		event: mousemove,
		node: "A",
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002, y: 1007} } };
	adapter.output.testEvent("blurNode", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

/*** Drag event (when a node starts being moved) ***/

it("can process a node 'drag' event", function() {
	adapter.init(element(), {nodes: {A: {}, B: {}}, edges: {AB: {from: "A", to: "B"}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("drag");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
		// It rounds it nicely to a tenth
		expect(variables).toEqual( { x: 1.3, y: 7 } );
	});
	var visEventData = {
		edges: ["AB"], // Attached edges get included for some reason.
		event: {pointerType: "mouse", type: "panstart"},
		nodes: ["A"],
		pointer: { DOM: {x: 2.3, y: 7.3}, canvas: {x: 102, y: 107} } };
	// Put in new values for the free event to catch
	adapter.output.objects.nodes.update({id: "A", x: 1.3456, y: 6.9876});
	adapter.output.testEvent("dragStart", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

/*** Free event (when a node is released) ***/

it("can process a node 'free' event", function() {
	adapter.init(element(), {nodes: {A: {}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("free");
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
		// It rounds it nicely to a tenth
		expect(variables).toEqual( { x: 1.3, y: 7 } );
	});
	var visEventData = {
		edges: [],
		event: {pointerType: "mouse", type: "panend"},
		nodes: ["A"],
		pointer: { DOM: {x: 2.3, y: 7.3}, canvas: {x: 102, y: 107} } };
	// Put in new values for the free event to catch
	adapter.output.objects.nodes.update({id: "A", x: 1.3456, y: 6.9876});
	adapter.output.testEvent("dragEnd", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

/*** Focus event on graph ***/

it("can do focus for graphs", function() {
	adapter.init(element(), {graph: {focus: true}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("focus");
		expect(graphEvent.objectType).toBe("graph");
	});
	adapter.output.getFrame().dispatchEvent({type: "focus"});
	expect(onevent).toHaveBeenCalledTimes(1);
	// Now we make sure that event is de-registered on destroy
	adapter.destroy();
	onevent.calls.reset();
	adapter.output.getFrame().dispatchEvent({type: "focus"});
	expect(onevent).not.toHaveBeenCalled();
});

it("can do blur for graphs", function() {
	adapter.init(element(), {graph: {blur: true}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("blur");
		expect(graphEvent.objectType).toBe("graph");
	});
	adapter.output.getFrame().dispatchEvent({type: "blur"});
	expect(onevent).toHaveBeenCalledTimes(1);
	// Now we make sure that event is de-registered on destroy
	adapter.destroy();
	onevent.calls.reset();
	adapter.output.getFrame().dispatchEvent({type: "blur"});
	expect(onevent).not.toHaveBeenCalled();

});

});
