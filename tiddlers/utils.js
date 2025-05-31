
var Adapters = $tw.modules.getModulesByTypeAsHashmap("graphengine");
var Adapter = Adapters["Vis-Network"];
var MockVis = require("./mock/vis");
var test = $tw.test = {};

test.setSpies = function() {
	spyOn(Adapter, "Vis").and.returnValue(MockVis);
	var adapter = Object.create(Adapter);
	adapter.onevent = function() {
		fail("Event called without spy.");
	};
	Object.defineProperty(adapter, "output", {
		get: function() { return this.vis; }
	});
	return {adapter};
};

// This ensure that the called event matches up with what the adapter says it
// invokes.
test.spyOnevent = function(adapter, fake) {
	var properties = adapter.properties;
	var spy = spyOn(adapter, "onevent").and.callFake(function(graphEvent, variables) {
		var category = properties[graphEvent.objectType];
		expect(category).not.toBeUndefined("ObjectType: " + graphEvent.objectType);
		if (graphEvent.objectType !== "graph") {
			expect(graphEvent.id).not.toBeUndefined("Id");
		}
		var property = category[graphEvent.type];
		expect(property).not.toBeUndefined(graphEvent);
		var expectedVars = property.variables || [];
		var actualVars = Object.keys(variables);
		expect($tw.utils.count(variables)).toBe(expectedVars.length, "Unexpected number of event arguments.");
		$tw.utils.each(expectedVars, function(name) {
			expect(actualVars).toContain(name);
		});
		if (fake) {
			fake(graphEvent, variables);
		}
	});
	return spy;
};
