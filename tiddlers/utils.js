
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
