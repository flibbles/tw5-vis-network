/*

Manages all the structure for graph manipulation.

*/

"use strict";

exports.manipulation = function(objects, changes) {
	var self = this,
		old = (objects.graph && objects.graph.manipulation) || defaults(),
		settings = $tw.utils.extend({}, old);
	if (!this.manipulation) {
		// We keep track of how many of these we have so we can know when to
		// keep these behaviors.
		this.manipulation = {
			deleteEdge: 0,
			deleteNode: 0,
			editEdge: 0,
			editNode: 0
		}
	}
	if (changes.graph) {
		if (changes.graph.addNode) {
			settings.addNode = function(nodeData, callback) {
				self.onevent({
					type: "addNode",
					objectType: "graph"
				},{
					x: round(nodeData.x),
					y: round(nodeData.y)});
			}
		} else {
			settings.addNode = false;
		}
		if (changes.graph.addEdge) {
			settings.addEdge = function(edgeData, callback) {
				self.onevent({
					type: "addEdge",
					objectType: "graph"
				},{
					fromTiddler: edgeData.from,
					toTiddler: edgeData.to});
			}
		} else {
			settings.addEdge = false;
		}
	}
	// Get an accurate count of object-specific manipulations
	if (changes.edges) {
		for (var id in changes.edges) {
			this.manipulation.deleteEdge += difference(objects.edges, changes.edges, id, "delete");
		}
	}
	if (changes.nodes) {
		for (var id in changes.nodes) {
			this.manipulation.deleteNode += difference(objects.nodes, changes.nodes, id, "delete");
			this.manipulation.editNode += difference(objects.nodes, changes.nodes, id, "edit");
		}
	}
	// If we have a positive number of object manipulations, add them now
	if (this.manipulation.deleteNode > 0) {
		settings.deleteNode = function(selected, callback) {
			self.onevent({
				type: "delete",
				objectType: "nodes",
				id: selected.nodes[0]}, {});
		}
	} else {
		settings.deleteNode = false;
	}
	if (this.manipulation.deleteEdge > 0) {
		settings.deleteEdge = function(selected, callback) {
			self.onevent({
				type: "delete",
				objectType: "edges",
				id: selected.edges[0]}, {});
		}
	} else {
		settings.deleteEdge = false;
	}
	// Now we install our manipulations if we have any.
	if (changed(old, settings)) {
		changes.graph = changes.graph || Object.create(null);
		if (changed(settings, defaults())) {
			changes.graph.manipulation = settings;
		} else {
			changes.graph.manipulation = false;
		}
	}
};

function defaults() {
	return {
		addEdge: false,
		addNode: false,
		editEdge: false,
		editNode: false,
		deleteEdge: false,
		deleteNode: false
	};
};

function changed(oldManipulate, newManipulate) {
	for (var action in newManipulate) {
		if (!newManipulate[action] !== !oldManipulate[action]) {
			return true;
		}
	}
	return false;
};

function difference(oldObjects, newObjects, id, action) {
	var oldObject = (oldObjects && oldObjects[id]) || {};
	var newObject = (newObjects && newObjects[id]) || {};
	return (newObject[action] || 0) - (oldObject[action] || 0);
};

function round(number) {
	return Math.round(number * 10) / 10;
};
