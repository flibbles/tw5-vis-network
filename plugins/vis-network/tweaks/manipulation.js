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
	if (changes.edges) {
		for (var id in changes.edges) {
			var edge = changes.edges[id];
			// TODO: If manipulation is passed as a property, it can trip stuff up.
			if (edge.manipulation) {
				manipulate = true;
				if (!graph) {
					graph = objects.graph;
					changes.graph = graph;
				}
				if (edge.manipulation.delete) {
					settings.deleteEdge = function(selected, callback) {
						self.onevent({
							type: "delete",
							objectType: "edges",
							id: selected.edges[0]}, {});
					}
				}
			}
		}
	}
	if (manipulate) {
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
