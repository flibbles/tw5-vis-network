/*\

Tests the Vis-Network adapter's ability to auto-select font colors for labels
inside nodes.

\*/

describe("Contrast", function() {

var adapter;
var darkFont = {color: "#000000"};
var lightFont = {color: "#ffffff"};

beforeEach(function() {
	({adapter} = $tw.test.setSpies());
});

function element() {
	return $tw.fakeDocument.createElement("div");
};

/*** Palette colors ***/

it("initializes with global style", function() {
	adapter.init(element(), {graph: {
		nodeColor: "#ffffff",
		fontColor: "#000000",
		graphColor: "#bbbbbb"}});
	var options = adapter.output.options;
	expect(options.nodes.color).toBe("#ffffff");
	expect(options.nodes.font.color).toBe("#000000");
	expect(options.edges.font.color).toBe("#000000");
	expect(options.edges.font.strokeColor).toBe("#bbbbbb");
	var properties = Object.keys(options);
	expect(properties).not.toContain("nodeColor");
	expect(properties).not.toContain("fontColor");
	expect(properties).not.toContain("graphColor");
});

/*** Auto fontColor contrast ***/

it("will assign contrasting colors when labels are inside node", function() {
	adapter.init(element(), {nodes: {
		dot1: {label: "label", shape: "dot", color: "#000000"},
		dot2: {label: "label", shape: "dot", color: "#ffffff"},
		box1: {label: "label", shape: "box", color: "#000000"},
		box2: {label: "label", shape: "box", color: "#ffffff"},
		// emp as in empty. No label
		emp1: {shape: "box", color: "#000000"},
		emp2: {shape: "box", color: "#ffffff"},
		font1: {label: "label", shape: "box", fontColor: "#333333", color: "#000000"},
		font2: {label: "label", shape: "box", fontColor: "#333333", color: "#ffffff"},
	}});
	expect(adapter.output.objects.nodes.entries).toEqual({
		dot1: {id: "dot1", label: "label", shape: "dot", color: "#000000"},
		dot2: {id: "dot2", label: "label", shape: "dot", color: "#ffffff"},
		box1: {id: "box1", label: "label", shape: "box", color: "#000000", font: lightFont},
		box2: {id: "box2", label: "label", shape: "box", color: "#ffffff", font: darkFont},
		emp1: {id: "emp1", shape: "box", color: "#000000"},
		emp2: {id: "emp2", shape: "box", color: "#ffffff"},
		font1: {id: "font1", label: "label", shape: "box", color: "#000000", font: {color: "#333333"}},
		font2: {id: "font2", label: "label", shape: "box", color: "#ffffff", font: {color: "#333333"}},
	});
});

it("will not assign contrasting font colors with no background", function() {
	adapter.init(element(), {nodes: {
		blank: {label: "label", shape: "box"},
		dark: {label: "label", shape: "box", color: "#000000"}
	}});
	expect(adapter.output.objects.nodes.entries).toEqual({
		blank: {id: "blank", label: "label", shape: "box"},
		dark: {id: "dark", label: "label", shape: "box", color: "#000000", font: {color: "#ffffff"}}
	});
});

it("can remove default contrasting font colors", function() {
	adapter.init(element(), {nodes: {
		A: {shape: "box", color: "#000000", label: "label"}}});
	adapter.update({nodes: {
		A: {shape: "box", color: "#000000"}}});
	var objects = adapter.output.objects;
	expect(objects.nodes.entries).toEqual({A: {id: "A", label: null, shape: "box", color: "#000000", font: null}});
});

it("considers global node color", function() {
	adapter.init(element(), {graph: {nodeColor: "#111111", fontColor: "#eeeeee"}, nodes: {
		dot: {shape: "dot", label: "label"},
		box: {shape: "box", label: "label"},
		empty: {shape: "box"},
		font: {shape: "box", label: "label", fontColor: "#333333"}
	}});
	expect(adapter.output.objects.nodes.entries).toEqual({
		dot: {id: "dot", label: "label", shape: "dot"},
		box: {id: "box", label: "label", shape: "box", font: lightFont},
		empty: {id: "empty", shape: "box"},
		font: {id: "font", label: "label", shape: "box", font: {color: "#333333"}}
	});
	// Make sure contrasts remain after a change
	adapter.update({nodes: {
		dot: {shape: "dot", label: "changed"},
		box: {shape: "box", label: "changed"},
		font: {shape: "box", label: "changed", fontColor: "#333333"}
	}});
	expect(adapter.output.objects.nodes.entries).toEqual({
		dot: {id: "dot", label: "changed", shape: "dot"},
		box: {id: "box", label: "changed", shape: "box", font: lightFont},
		empty: {id: "empty", shape: "box"},
		font: {id: "font", label: "changed", shape: "box", font: {color: "#333333"}}
	});
});

});
