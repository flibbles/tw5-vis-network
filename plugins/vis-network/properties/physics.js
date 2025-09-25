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

exports.properties = {
	graph: {
		physics: {type: "boolean", default: true},
		centralGravity: {type: "number", parent: "physics",
			min: 0, max: 1, increment: 0.1, default: 0.3},
		damping: {type: "number", parent: "physics",
			min: 0, max: 1, increment: 0.01, default: 0.09},
		gravitationalConstant: {type: "number", parent: "physics",
			min: -2000, max: 0, increment: 10, default: -2000},
		springConstant: {type: "number", parent: "physics",
			min: 0, max: 0.2, increment: 0.01, default: 0.04},
		springLength: {type: "number", parent: "physics",
			min: 0, max: 200, increment: 10, default: 95},
		maxVelocity: {type: "number", parent: "physics",
			min: 1, default: 50, max: 100},
	},
	nodes: {
		physics: {type: "boolean", default: true},
	},
	edges: {
		physics: {type: "boolean", default: true},
	}
};

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
