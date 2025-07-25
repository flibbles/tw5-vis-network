/*\

Tests the image capability of nodes.

\*/

describe("Image", function() {

var adapter, window;
var embeddedUrl;

beforeAll(function() {
	var parser = $tw.wiki.parseTiddler("$:/plugins/flibbles/vis-network/icon");
	embeddedUrl = parser.tree[0].attributes.src.value;
});

beforeEach(function() {
	({adapter, window} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

/*** Node icon ***/

it("Works with just image setting", function() {
	adapter.init(element(), {nodes: {
		A: {image: embeddedUrl},
		B: {image: embeddedUrl, circular: true}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({
		A: {id: "A", shape: "image", image: embeddedUrl},
		B: {id: "B", shape: "circularImage", image: embeddedUrl}});
});

it("prefers images settings to shape settings", function() {
	adapter.init(element(), {nodes: {
		A: {image: embeddedUrl, shape: "box"},
		B: {image: embeddedUrl, shape: "box", circular: true}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({
		A: {id: "A", shape: "image", image: embeddedUrl},
		B: {id: "B", shape: "circularImage", image: embeddedUrl}});
});

it("image settings alone does not crash vis", function() {
	adapter.init(element(), {nodes: {
		A: {shape: "image"},
		B: {shape: "circularImage"}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A"}, B: {id: "B"}});
});

/*** Background image ***/

it("Works with background setting", function() {
	var image;
	var canvas = { drawImage: function(image, x, y) {
		expect(image.src).toBe(embeddedUrl);
		expect(x).toBe(-40);
		expect(y).toBe(-25);
	} };
	window().Image = function() {
		image = this;
	};
	adapter.init(element(), {graph: { background: embeddedUrl }});
	var options = adapter.output.options;
	expect(Object.keys(options)).not.toContain("background");
	expect(image.onload).not.toBeUndefined();
	var canvasSpy = spyOn(canvas, "drawImage").and.callThrough();
	var redrawSpy = spyOn(adapter.output, "redraw");
	image.onload();
	expect(redrawSpy).toHaveBeenCalled();
	image.width=80;
	image.height=50;
	adapter.output.testEvent("beforeDrawing", canvas);
	expect(canvasSpy).toHaveBeenCalled();
	// Now we unset it
	canvasSpy.calls.reset();
	adapter.update({graph: {}});
	options = adapter.output.options;
	expect(Object.keys(options)).not.toContain("background");
	adapter.output.testEvent("beforeDrawing", canvas);
	expect(canvasSpy).not.toHaveBeenCalled();
});

it("does not reload background unnecessarily", function() {
	var image;
	window().Image = function() {
		image = this;
	};
	adapter.init(element(), {graph: { background: embeddedUrl }});
	var oldImage = image;
	image.onload();
	adapter.update({graph: { background: embeddedUrl, addNode: true}});
	expect(image).toBe(oldImage);
});

});
