/*

Manages all the structure for graph manipulation.

*/

"use strict";

exports.manipulation = function(objects) {
	var self = this,
		graph = objects.graph,
		manipulate = false;
	if (graph && graph.manipulation) {
		if (graph.manipulation.addNode) {
			manipulate = true;
			graph.manipulation.addNode = function(nodeData, callback) {
				self.onevent({
					type: "addNode",
					objectType: "graph"
				},{
					x: nodeData.x,
					y: nodeData.y});
			}
		} else {
			graph.manipulation.addNode = false;
		}
		if (graph.manipulation.addEdge) {
			manipulate = true;
			graph.manipulation.addEdge = function(edgeData, callback) {
				self.onevent({
					type: "addEdge",
					objectType: "graph"
				},{
					fromTiddler: edgeData.from,
					toTiddler: edgeData.to});
			}
		} else {
			graph.manipulation.addEdge = false;
		}
	}
	if (!manipulate) {
		// No manipulation was enabled.
		// Scrap what we have and set it all to false.
		graph.manipulation = false;
	}
};
