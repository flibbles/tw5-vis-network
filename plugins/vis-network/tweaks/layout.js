/*

Manages all the hierarchy for graph manipulation.

*/

"use strict";

var map = {
	hierarchyDirection: "direction",
	hierarchyNodeSpacing: "nodeSpacing",
	hierarchyParentCentralization: "parentCentralization",
	hierarchyShakeTowards: "shakeTowards",
	hierarchySortMethod: "sortMethod",
};

exports.layout = function(objects, changes) {
	var graph = changes.graph;
	if (graph) {
		if (graph.hierarchy !== undefined) {
			graph.layout = {hierarchical: graph.hierarchy};
			graph.hierarchy = undefined;
		} else if (objects.graph && objects.graph.layout && objects.graph.layout.hierarchical) {
			// It was already there. It must be removed.
			graph.layout = {hierarchical: false};
		}
		var layout = graph.layout;
		for (var property in graph) {
			if (map[property]) {
				if (layout && layout.hierarchical !== false) {
					if (typeof layout.hierarchical !== "object") {
						layout.hierarchical = {};
					}
					layout.hierarchical[map[property]] = graph[property];
				}
				// One way or another, we must always remove all
				// single-depth hierarchy settings
				graph[property] = undefined;
			}
		}
	}
};
