/*\

Tests Vis-Network adapter's ability to set (or figure out) a node's position

\*/

describe("Position", function() {

var adapter;

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can have no preset positions", function() {
	adapter.init(element(), {graph: {}, nodes: {A: {}, B: {}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A"}, B: {id: "B"}});
});

it("can preserve generated positions for some nodes", function() {
	adapter.init(element(), {graph: {}, nodes: {
		A: {value: 1},
		B: {value: 1, x: 3, y: 5}}});
	var objects = adapter.output.objects;
	// This will result in vis-network ignoring B's location,
	// but it's intended behavior, so we'll keep it.
	expect(objects.nodes.entries).toEqual({
		A: {id: "A", value: 1},
		B: {id: "B", value: 1, x: 3, y: 5}});
	// Let's act like Vis-Network came up with its own coordinates for B
	objects.nodes.update({id: "B", x: 17, y: 19, value: 1});
	// Now update through adapter
	adapter.update({nodes: {
		A: {value: 2},
		B: {value: 2, x: 3, y: 5}}});
	objects = adapter.output.objects;
	// values should have changed, but vis-chosen positions remain
	expect(objects.nodes.entries).toEqual({
		A: {id: "A", value: 2},
		// This stays the same
		B: {id: "B", value: 2, x: 17, y: 19}});
});

it("can preserve generated positions for some nodes", function() {
	adapter.init(element(), {graph: {}, nodes: {
		A: {value: 1},
		B: {value: 1, x: 3, y: 5}}});
	var objects = adapter.output.objects;
	// This will result in vis-network ignoring B's location,
	// but it's intended behavior, so we'll keep it.
	expect(objects.nodes.entries).toEqual({
		A: {id: "A", value: 1},
		B: {id: "B", value: 1, x: 3, y: 5}});
	// Let's act like Vis-Network came up with its own coordinates for B
	objects.nodes.update({id: "B", x: 17, y: 19, value: 1});
	// Now update through adapter
	adapter.update({nodes: { A: {value: 2}, B: {value: 2, x: 3, y: 6}}});
	objects = adapter.output.objects;
	// new position, so override vis choice.
	expect(objects.nodes.entries).toEqual({
		A: {id: "A", value: 2},
		B: {id: "B", value: 2, x: 3, y: 6}});
});

it("can remove and reinsert nodes with fixed positions", function() {
	adapter.init(element(), {graph: {}, nodes: { B: {x: 3, y: 5}}});
	var objects = adapter.output.objects;
	// Let's act like Vis-Network came up with its own coordinates for B
	objects.nodes.update({id: "B", x: 17, y: 19});
	// Now update through adapter
	adapter.update({nodes: { B: null}});
	// Now put it back
	adapter.update({nodes: { B: {x: 3, y: 5}}});
	objects = adapter.output.objects;
	// new position, so override vis choice.
	expect(objects.nodes.entries).toEqual({ B: {id: "B", x: 3, y: 5}});
});

it("can remove and reinsert nodes without position", function() {
	adapter.init(element(), {graph: {}, nodes: { B: {x: 3, y: 5}}});
	var objects = adapter.output.objects;
	// Let's act like Vis-Network came up with its own coordinates for B
	objects.nodes.update({id: "B", x: 17, y: 19});
	// Now update through adapter
	adapter.update({nodes: { B: null}});
	// Now put it back without any position
	adapter.update({nodes: { B: {}}});
	// Now update it with a position which it originally had
	adapter.update({nodes: { B: {x: 3, y: 5}}});
	objects = adapter.output.objects;
	// new position, so override vis choice.
	expect(objects.nodes.entries).toEqual({ B: {id: "B", x: 3, y: 5}});
});

});
