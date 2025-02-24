/*\

Tests the Vis-Network adapter's ability to translate incoming properties.

\*/

var Adapter = $tw.modules.getModulesByTypeAsHashmap("graphengine")["Vis-Network"];
var translate = Adapter.translate;

describe("Adapter", function() {

it("works", function() {
	var output = translate({nodes: {A: {color: "#0000ff"}}});
	expect(output).toEqual({nodes: [{id: "A", color: "#0000ff"}]});
});

it("passes along nulls flagging deletion", function() {
	var output = translate({nodes: {A: {label: "label"}, B: null}});
	expect(output).toEqual({nodes: [{id: "A", label: "label"}, "B"]});
});

});
