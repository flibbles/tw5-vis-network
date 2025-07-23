/*

Manages all the physics for the graph object.

*/

"use strict";

var map = {
	maxVelocity: "maxVelocity",
};

var solverSettings = {
	springConstant: "springConstant",
};

var solver = "barnesHut"; //"forceAtlas2Based";

exports.name = "physics";

exports.process = function(objects, changes) {
	var graph = changes.graph;
	var enabled = true;
	if (graph) {
		if (graph.physics !== undefined) {
			if (typeof graph.physics === "boolean") {
				// The only reason this wouldn't happen is because our graph
				// settings got recreated by "manipulation", and thus we have
				// an actually fully formed physics object.
				graph.physics = {enabled: graph.physics};
			}
			enabled = graph.physics.enabled;
		} else {
			if (objects.graph && objects.graph.physics) {
				// It was specified at some point. We must continued
				// to specify it, even if only to set the default.
				graph.physics = {enabled: true};
			}
			enabled = true;
		}
		for (var property in map) {
			if (graph[property] !== undefined) {
				if (enabled) {
					graph.physics = graph.physics || {};
					graph.physics[map[property]] = graph[property];
				}
				graph[property] = undefined;
			}
		}
		for (var property in solverSettings) {
			if (graph[property] !== undefined) {
				if (enabled) {
					graph.physics = graph.physics || {};
					graph.physics[solver] = graph.physics[solver] || {};
					//graph.physics[solver][solverSettings[property]] = graph[property];
				}
				graph[property] = undefined;
			}
		}
	}
};
