/*

Manages all the structure for graph interaction.

*/

"use strict";

exports.name = "interaction";

exports.process = function(objects, changes) {
	var graph = changes.graph;
	if (graph) {
		if (graph.zoom !== undefined) {
			graph.interaction = graph.interaction || {};
			graph.interaction.zoomView = graph.zoom;
			graph.zoom = undefined;
		} else if (objects.graph && objects.graph.interaction && objects.graph.interaction.zoomView == false) {
			// It was set, and now we're unsetting it back to true
			graph.interaction = {zoomView: true};
		}
		if (graph.navigation !== undefined) {
			graph.interaction = graph.interaction || {};
			graph.interaction.navigationButtons = graph.navigation;
			graph.navigation = undefined;
		} else if (objects.graph && objects.graph.interaction && objects.graph.interaction.navigationButtons == true) {
			// It was set, and now we're unsetting it back to true
			graph.interaction = graph.interaction || {};
			graph.interaction.navigationButtons = false;
		}
		if (graph.zoomSpeed !== undefined) {
			graph.interaction = graph.interaction || {};
			graph.interaction.zoomSpeed = graph.zoomSpeed;
			graph.zoomSpeed = undefined;
		} else if (objects.graph && objects.graph.interaction && objects.graph.interaction.zoomSpeed !== undefined) {
			graph.interaction = graph.interaction || {};
			graph.interaction.zoomSpeed = 1;
		}
	}
};
