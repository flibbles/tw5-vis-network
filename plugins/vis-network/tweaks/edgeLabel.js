/*

Handles a bug in vis-network where edge labels cannot be removed.

*/

"use strict";

exports.edgeLabel = function(objects, changes) {
	if (changes.edges && objects.edges) {
		for (var id in changes.edges) {
			var edge = changes.edges[id];
			if (edge
			&& !edge.label
			&& objects.edges[id]
			&& objects.edges[id].label) {
				edge.label = "\0";
			}
		}
	}
};
