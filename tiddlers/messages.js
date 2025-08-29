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

fit("can do doubleclick for graphs", function() {
	adapter.init(element(), {});
	var moveTo = spyOn(adapter.output, "moveTo");
	adapter.handleMessage({type: "graph-zoom-to"}, {x: 14, y: 17});
	expect(moveTo).toHaveBeenCalledWith({position: {x: 14, y: 17}});
});

});
