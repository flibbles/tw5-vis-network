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
smooths.dynamic.roundness = 0.5;
smooths.cubicBezier.forceDirection = "none";
smooths.cubicBezierHorizontal.type = "cubicBezier";
smooths.cubicBezierHorizontal.forceDirection = "horizontal";
smooths.cubicBezierVertical.type = "cubicBezier";
smooths.cubicBezierVertical.forceDirection = "vertical";

exports.name = "edges";

exports.process = function(objects, changes) {
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
					edge.smooth = Object.assign({}, smooths[edge.smooth]);
					edge.smooth.roundness = (edge.roundness === undefined)?
						0.5: edge.roundness;
				} else if (old.smooth !== undefined) {
					// Once smooth is set, it can never truly be unset without
					// vis-network crashes occurring.
					edge.smooth = smooths.dynamic;
				}
				if (edge.roundness !== undefined) {
					edge.roundness = undefined;
				}
				if (edge.arrows === " ") {
					edge.arrows = "";
				}
			}
		}
	}
};
