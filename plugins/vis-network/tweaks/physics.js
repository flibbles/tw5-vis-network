/*

Manages all the physics for the graph object.

*/

"use strict";

var map = {
	springConstant: "springConstant",
	maxVelocity: "maxVelocity",
};

exports.physics = function(objects, changes) {
	var graph = changes.graph;
	var enabled = true;
	if (graph) {
		if (graph.physics !== undefined) {
			if (typeof graph.physics === "boolean") {
				// The only reason this wouldn't happen is because our graph settings
				// got recreated by "manipulation", and thus we have an actually fully
				// formed physics object.
				graph.physics = {enabled: graph.physics};
			}
			enabled = graph.physics.enabled;
		} else {
			if (objects.graph && objects.graph.physics) {
				// It was specified at some point. We must continued to specify it,
				// even if only to set the default.
				graph.physics = {enabled: true};
			}
			enabled = true;
		}
		/*else if (objects.graph && objects.graph.physics && objects.graph.physics) {
			// It was already there. It must be removed.
			graph.physics = {enabled: false};
		}
		*/
		for (var property in map) {
			if (graph[property] !== undefined) {
				if (enabled) {
					graph.physics = graph.physics || {};
					graph.physics[map[property]] = graph[property];
				}
				graph[property] = undefined;
			}
		}
	}
};
