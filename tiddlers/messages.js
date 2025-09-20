/*\

Tests the Vis-Network accepted messages.

\*/

describe("Messages", function() {

var adapter;

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("can do doubleclick for graphs", function() {
	adapter.init(element(), {});
	var moveTo = spyOn(adapter.output, "moveTo");
	adapter.handleMessage({type: "graph-move-view"}, {x: 14, y: 17});
	expect(moveTo).toHaveBeenCalledWith({position: {x: 14, y: 17}, animation: true});
});

it("can center on a node", function() {
	adapter.init(element(), {nodes: { A: {}}});
	var focus = spyOn(adapter.output, "focus");
	adapter.handleMessage({type: "graph-center-node"}, {tiddler: "A", scale: 1.5});
	expect(focus).toHaveBeenCalledWith("A", {scale: 1.5, animation: true});
});

it("tries to center on non-existent nodes", function() {
	// This is fine to allow because vis-network handles non-existence
	adapter.init(element(), {nodes: { A: {}}});
	var focus = spyOn(adapter.output, "focus");
	adapter.handleMessage({type: "graph-center-node"}, {tiddler: "B"});
	expect(focus).toHaveBeenCalledWith("B", {animation: true});
});

it("can generate an export of the graph", function() {
	var store = "$:/temp/test/export";
	adapter.init(element(), {});
	var raw64 = $tw.utils.base64Encode("PNG data");
	var make = spyOn(adapter.output.canvasElement, "toDataURL").and.returnValue(raw64);
	adapter.handleMessage({type: "graph-export-png"}, {targetTiddler: store});
	expect(make).toHaveBeenCalled();
	var tiddler = $tw.wiki.getTiddler(store);
	expect(tiddler.fields.text).toBe(raw64);
	expect(tiddler.fields.type).toBe("image/png");
	$tw.wiki.deleteTiddler(store);
});

});
