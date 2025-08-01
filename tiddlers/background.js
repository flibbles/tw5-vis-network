/*\

Tests the background image of the adapter.

\*/

describe("Background", function() {

var adapter, window;
var imageTiddler = "$:/plugins/flibbles/vis-network/icon";
var embeddedUrl;
var drawEvent = "beforeDrawing";

beforeAll(function() {
	var parser = $tw.wiki.parseTiddler(imageTiddler);
	embeddedUrl = parser.tree[0].attributes.src.value;
});

beforeEach(function() {
	({adapter, window} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

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
	adapter.output.testEvent(drawEvent, canvas);
	expect(canvasSpy).toHaveBeenCalled();
	// Now we unset it
	canvasSpy.calls.reset();
	adapter.update({graph: {}});
	options = adapter.output.options;
	expect(Object.keys(options)).not.toContain("background");
	adapter.output.testEvent(drawEvent, canvas);
	expect(canvasSpy).not.toHaveBeenCalled();
});

it("does not reload background unnecessarily", function() {
	var image;
	window().Image = function() {
		image = this;
	};
	adapter.init(element(), {graph: { background: embeddedUrl }});
	var canvas = { drawImage: function(image, x, y) { } };
	image.onload();
	adapter.output.testEvent(drawEvent, canvas);
	var oldImage = image;
	image.onload();
	// Now we update something unrelated
	var canvasSpy = spyOn(canvas, "drawImage").and.callThrough();
	adapter.update({graph: { background: embeddedUrl, addNode: true}});
	var options = adapter.output.options
	expect(image).toBe(oldImage);
	expect(Object.keys(options)).not.toContain("background");
	// issue #40: modifying something else caused the background to unset
	adapter.output.testEvent(drawEvent, canvas);
	expect(canvasSpy).toHaveBeenCalled();
});

it("modifying background url", function() {
	var image;
	window().Image = function() {
		image = this;
	};
	adapter.init(element(), {graph: { background: embeddedUrl }});
	var canvas = { drawImage: function(image, x, y) { } };
	image.onload();
	adapter.output.testEvent(drawEvent, canvas);
	// Now we set it to something remote or broken
	var canvasSpy = spyOn(canvas, "drawImage").and.callThrough();
	adapter.update({graph: {background: imageTiddler + "x"}});
	var options = adapter.output.options
	expect(Object.keys(options)).not.toContain("background");
	adapter.output.testEvent(drawEvent, canvas);
	expect(canvasSpy).not.toHaveBeenCalled();
	// Now set it back to something real
	canvasSpy.calls.reset();
	adapter.update({graph: { background: embeddedUrl }});
	image.onload();
	options = adapter.output.options
	expect(Object.keys(options)).not.toContain("background");
	adapter.output.testEvent(drawEvent, canvas);
	expect(canvasSpy).toHaveBeenCalled();
});

});
