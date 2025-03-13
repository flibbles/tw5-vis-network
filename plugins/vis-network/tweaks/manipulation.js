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
	}
};
