/*\

Tests the image capability of nodes.

\*/

fdescribe("Image", function() {

var adapter;

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

it("Works", function() {
	var parser = $tw.wiki.parseTiddler("$:/plugins/flibbles/vis-network/icon");
	var url = parser.tree[0].attributes.src.value;
	adapter.init(element(), {nodes: {A: {image: url}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A", image: url}});
});

});
