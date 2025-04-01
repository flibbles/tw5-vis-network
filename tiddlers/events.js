/*\

Tests the Vis-Network standard events.

\*/

var MockVis = require("./mock/vis");
var adapter;

describe("Events", function() {

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can do doubleclick for graphs", function() {
	adapter.init(element(), {graph: {doubleclick: true}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("doubleclick");
		expect(graphEvent.objectType).toBe("graph");
		expect(variables).toEqual({x: 1002, y: 1007, xView: 2, yView: 7});
	});
	var visEventData = {
		edges: [],
		event: {pointerType: "mouse", type: "doubletap"},
		nodes: [],
		pointer: { DOM: {x: 2, y: 7}, canvas: {x: 1002, y: 1007} } };
	adapter.output.testEvent("doubleClick", visEventData);
	expect(onevent).toHaveBeenCalledTimes(1);
});

it("can do doubleclick for nodes", function() {
	adapter.init(element(), {nodes: {A: {doubleclick: true}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("doubleclick");
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
	adapter.init(element(), {nodes: {A: {}, B: {}}, edges: {AB: {from: "A", to: "B", doubleclick: true}}});
	var onevent = $tw.test.spyOnevent(adapter, function(graphEvent, variables) {
		expect(graphEvent.type).toBe("doubleclick");
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

// TODO: Test all the other basic events too, like hover, blur, drag, etc...

});
