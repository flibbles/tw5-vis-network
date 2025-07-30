/*

Manages all the physics for the graph object.

*/

"use strict";

var map = {
	maxVelocity: "maxVelocity",
};

var physics = {
	barnesHut: {
		theta: 0.5,
		gravitationalConstant: -2000,
		centralGravity: 0.3,
		springLength: 95,
		springConstant: 0.04,
		damping: 0.09,
		avoidOverlap: 0
	},
	forceAtlas2Based: {
		theta: 0.5,
		gravitationalConstant: -50,
		centralGravity: 0.01,
		springConstant: 0.08,
		springLength: 100,
		damping: 0.4,
		avoidOverlap: 0
	}
};

//var solver = "barnesHut";
var solver = "forceAtlas2Based";

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
				graph.physics = freshSettings({enabled: graph.physics});
			}
			enabled = graph.physics.enabled;
		} else {
			if (objects.graph && objects.graph.physics) {
				// It was specified at some point. We must continued
				// to specify it, even if only to set the default.
				graph.physics = freshSettings({enabled: true});
			}
			enabled = true;
		}
		for (var property in map) {
			if (graph[property] !== undefined) {
				if (enabled) {
					graph.physics = graph.physics || freshSettings();
					graph.physics[map[property]] = graph[property];
				}
				graph[property] = undefined;
			}
		}
		var solverSettings = physics[solver];
		for (var property in solverSettings) {
			if (graph[property] !== undefined) {
				if (enabled) {
					graph.physics = graph.physics || freshSettings();
					graph.physics[solver][property] = graph[property];
				}
				graph[property] = undefined;
			}
		}
	}
};

function freshSettings(initial) {
	initial = initial || {};
	initial[solver] = Object.assign({}, physics[solver]);
	initial.solver = solver;
	return initial;
};
