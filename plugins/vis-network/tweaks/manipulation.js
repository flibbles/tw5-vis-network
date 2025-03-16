/*

Manages all the structure for graph manipulation.

*/

"use strict";

exports.manipulation = function(objects, changes) {
	var self = this,
		manipulate = false,
		settings = {
			addEdge: false,
			addNode: false,
			editEdge: false,
			editNode: false,
			deleteEdge: false,
			deleteNode: false
		},
		graph = changes.graph;
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
	if (graph && graph.manipulation) {
		if (graph.manipulation.addNode) {
			manipulate = true;
			settings.addNode = function(nodeData, callback) {
				self.onevent({
					type: "addNode",
					objectType: "graph"
				},{
					x: round(nodeData.x),
					y: round(nodeData.y)});
			}
		}
		if (graph.manipulation.addEdge) {
			manipulate = true;
			settings.addEdge = function(edgeData, callback) {
				self.onevent({
					type: "addEdge",
					objectType: "graph"
				},{
					fromTiddler: edgeData.from,
					toTiddler: edgeData.to});
			}
		}
	}
	// Get an accurate count of object-specific manipulations
	if (changes.edges) {
		for (var id in changes.edges) {
			var edge = changes.edges[id];
			if (edge == null) {
				if (objects.edges[id].delete) {
					this.manipulation.deleteEdge--;
				}
			} else if (edge.delete) {
				this.manipulation.deleteEdge++;
			}
		}
	}
	if (changes.nodes) {
		for (var id in changes.nodes) {
			var node = changes.nodes[id];
			if (node == null) {
				if (objects.nodes[id].delete) {
					this.manipulation.deleteNode--;
				}
				if (objects.nodes[id].edit) {
					this.manipulation.editNode--;
				}
			} else {
				if (node.delete) {
					this.manipulation.deleteNode++;
				}
				if (node.edit) {
					this.manipulation.editNode++;
				}
			}
		}
	}
	// If we have a positive number of object manipulations, add them now
	if (this.manipulation.deleteNode > 0) {
		manipulate = true;
		settings.deleteNode = function(selected, callback) {
			self.onevent({
				type: "delete",
				objectType: "nodes",
				id: selected.nodes[0]}, {});
		}
	}
	if (this.manipulation.deleteEdge > 0) {
		manipulate = true;
		settings.deleteEdge = function(selected, callback) {
			self.onevent({
				type: "delete",
				objectType: "edges",
				id: selected.edges[0]}, {});
		}
	}
	// Now we install our manipulations if we have any.
	if (manipulate) {
		if (!graph) {
			graph = objects.graph;
			changes.graph = graph;
		}
		graph.manipulation = settings;
	} else if (graph && (objects.graph && objects.graph.manipulation)) {
		// No manipulation anymore, but there used to be, so we must
		// explicitly set to false.
		graph.manipulation = false;
	}
};

function round(number) {
	return Math.round(number * 10) / 10;
};
