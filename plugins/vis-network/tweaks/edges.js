/*

Handles a bug in vis-network where edge labels cannot be removed.

*/

"use strict";

var smooths = {};
$tw.utils.each(["dynamic", "continuous", "discrete", "diagonalCross", "straightCross", "horizontal", "vertical", "curvedCW", "curvedCCW", "cubicBezier", "cubicBezierHorizontal", "cubicBezierVertical"], function(type) {
	smooths[type] = {enabled: true, type: type};
});

// We set type to an empty object instead of null, because vis-network
// will erroneously try to access it in some cases.
smooths.no = {enabled: false, type: {}};
smooths.cubicBezier.forceDirection = false;
smooths.cubicBezierHorizontal.forceDirection = "horizontal";
smooths.cubicBezierVertical.forceDirection = "vertical";

exports.edges = function(objects, changes) {
	if (changes.edges) {
		var oldEdges = (objects && objects.edges) || {};
		for (var id in changes.edges) {
			var edge = changes.edges[id];
			var old = oldEdges[id] || {};
			if (edge) {
				// fix for vis-network edge label but
				if (!edge.label && old.label) {
					edge.label = "\0";
				}
				// Fix for flibbles/tw5-graph#33 bug
				if (edge.smooth) {
					edge.smooth = smooths[edge.smooth];
				} else if (old.smooth !== undefined) {
					// Once smooth is set, it can never truly be unset without
					// vis-network crashes occurring.
					edge.smooth = smooths.dynamic;
				}
			}
		}
	}
};

function hierarchyEnabled(objects, changes) {
	if (changes.graph && changes.graph.hierarchy) {
		return changes.graph.hierarchy;
	}
	return !!(objects.graph && objects.graph.layout && objects.graph.layout.hierarchical);
};
