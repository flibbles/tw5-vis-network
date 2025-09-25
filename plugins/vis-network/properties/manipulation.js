/*

Manages all the structure for graph manipulation.

*/

"use strict";

exports.name = "manipulation";

exports.properties = {
	graph: {
		hideControls: {type: "boolean", default: false, description: "Hide node and edge manipulation controls by default"},
		addNode: {type: "actions", variables: ["x", "y"]},
		addEdge: {type: "actions", variables: ["fromTiddler", "toTiddler"]},
	},
	nodes: {
		delete: {type: "actions", variables: []},
		edit: {type: "actions", variables: []},
	},
	edges: {
		delete: {type: "actions"},
		//edit: {type: "actions", variables: []},
	}
};

exports.process = function(objects, changes) {
	var self = this,
		old = objects.graph && objects.graph.manipulation,
		wasUnset = !old;
	if (wasUnset) {
		old = defaults();
	}
	var settings = $tw.utils.extend({}, old);
	if (!this.manipulation) {
		// We keep track of how many of these we have so we can know when to
		// keep these behaviors.
		this.manipulation = {
			deleteEdge: 0,
			deleteNode: 0,
			editEdge: 0,
			editNode: 0,
			fold: false
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
		// We set it undefined, whatever it is, because it'll need to be purged
		// before being passed to vis. It doesn't like unknown properties.
		changes.graph.addNode = undefined;
		changes.graph.addEdge = undefined;
	}
	// Get an accurate count of object-specific manipulations
	if (changes.edges) {
		for (var id in changes.edges) {
			this.manipulation.deleteEdge += difference(objects.edges, changes.edges, id, "delete");
		}
	}
	var oldEditCount = this.manipulation.editNode;
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
			callback({nodes: [], edges: []});
		}
	} else {
		settings.deleteNode = false;
	}
	if (this.manipulation.editNode > 0) {
		settings.editNode = function(node, callback) {
			self.onevent({
				type: "edit",
				objectType: "nodes",
				id: node.id}, {});
			callback(null);
		}
	} else {
		// Look at this. vis-network treats editNode differently.
		// They don't take a boolean to turn it off, but they forgot that
		// that means it can't be turned off at all without logging an
		// error. YAY. We minimize how often we explicitly set editNode
		// to false, to minimize this error.
		settings.editNode = (oldEditCount > 0)? false: undefined;
	}
	if (this.manipulation.deleteEdge > 0) {
		settings.deleteEdge = function(selected, callback) {
			self.onevent({
				type: "delete",
				objectType: "edges",
				id: selected.edges[0]}, {});
			callback({nodes: [], edges: []});
		}
	} else {
		settings.deleteEdge = false;
	}
	// We check if we manually set our manipulation folding
	var fold = false;
	if (changes.graph) {
		fold = !!changes.graph.hideControls;
		changes.graph.hideControls = undefined;
	} else {
		fold = this.manipulation.fold;
	}
	// Now we install our manipulations if we have any.
	if (changed(old, settings) || fold !== this.manipulation.fold) {
		changes.graph = changes.graph || objects.graph || Object.create(null);
		this.manipulation.fold = fold;
		if (changed(settings, defaults())) {
			settings.initiallyActive = !fold;
			changes.graph.manipulation = settings;
		} else {
			changes.graph.manipulation = false;
		}
	} else if (changes.graph && !wasUnset) {
		// If we're updating graph settings, but not manipulation,
		// we must preserve the old manipulation settings.
		changes.graph.manipulation = old;
	}
};

function defaults() {
	return {
		addEdge: false,
		addNode: false,
		editEdge: false,
		editNode: undefined,
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
