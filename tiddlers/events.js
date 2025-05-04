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
		// It rounds to nice numbers
		expect(variables).toEqual({x: 1002.3, y: 1008, xView: 2, yView: 7});
	});
	var visEventData = {
		edges: [],
		event: {pointerType: "mouse", type: "doubletap"},
		nodes: [],
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002.3456, y: 1007.9876} } };
	adapter.output.testEvent("doubleClick", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
	expect(Object.keys(adapter.output.options)).not.toContain(dbclick);
});

it("can do doubleclick for nodes", function() {
	adapter.init(element(), {nodes: {A: {[dbclick]: true}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe(dbclick);
		expect(graphEvent.objectType).toBe("nodes");
		expect(graphEvent.id).toBe("A");
		expect(variables).toEqual({x: 1002, y: 1007, xView: 2, yView: 7});
	});
	var visEventData = {
		edges: [],
		event: {pointerType: "mouse", type: "doubletap"},
		nodes: ["A"],
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002, y: 1007} } };
	adapter.output.testEvent("doubleClick", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("can do doubleclick for edges", function() {
	adapter.init(element(), {nodes: {A: {}, B: {}}, edges: {AB: {from: "A", to: "B", [dbclick]: true}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe(dbclick);
		expect(graphEvent.objectType).toBe("edges");
		expect(graphEvent.id).toBe("AB");
		expect(variables).toEqual({x: 1002, y: 1007, xView: 2, yView: 7});
	});
	var visEventData = {
		edges: ["AB"],
		event: {pointerType: "mouse", type: "doubletap"},
		nodes: [],
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002, y: 1007} } };
	adapter.output.testEvent("doubleClick", visEventData);
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
	var newPos = { A: {x: 1.3456, y: 6.9876} };
	spyOn(adapter.output, "getPosition").and.callFake(function(id) { return newPos[id]; });
	adapter.output.testEvent("dragEnd", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

});
