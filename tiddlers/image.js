/*\

Tests the image capability of nodes.

\*/

fdescribe("Image", function() {

var adapter;
var embeddedUrl;

beforeAll(function() {
	var parser = $tw.wiki.parseTiddler("$:/plugins/flibbles/vis-network/icon");
	embeddedUrl = parser.tree[0].attributes.src.value;
});

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("Works with just image setting", function() {
	adapter.init(element(), {nodes: {
		A: {image: embeddedUrl},
		B: {circularImage: embeddedUrl}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({
		A: {id: "A", shape: "image", image: embeddedUrl},
		B: {id: "B", shape: "circularImage", image: embeddedUrl}});
});

it("prefers images settings to shape settings", function() {
	adapter.init(element(), {nodes: {
		A: {image: embeddedUrl, shape: "box"},
		B: {circularImage: embeddedUrl, shape: "box"}}});
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

});
