/*

Handles a bug in vis-network where edge labels cannot be removed.

*/

"use strict";

exports.edges = function(objects, changes) {
	if (changes.edges && objects.edges) {
		for (var id in changes.edges) {
			var edge = changes.edges[id];
			if (edge) {
				// fix for vis-network edge label but
				if (!edge.label
				&& objects.edges[id]
				&& objects.edges[id].label) {
					edge.label = "\0";
				}
				// Fix for https://github.com/flibbles/tw5-graph/issues/33 bug
				if (!edge.smooth
				&& objects.edges[id]
				&& objects.edges[id].smooth !== undefined) {
					edge.smooth = false;
				}
			}
		}
	}
};
