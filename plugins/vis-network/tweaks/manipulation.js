/*

Manages all the structure for graph manipulation.

*/

"use strict";

exports.manipulation = function(objects) {
	var self = this,
		graph = objects.graph;
	if (graph && graph.manipulation) {
		if (graph.manipulation.addNode) {
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
};
