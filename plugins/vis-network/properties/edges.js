/*

Handles a bug in vis-network where edge labels cannot be removed.

*/

"use strict";

var smooths = {};
var curves = ["dynamic", "continuous", "discrete", "diagonalCross", "straightCross", "horizontal", "vertical", "curvedCW", "curvedCCW", "cubicBezier", "cubicBezierHorizontal", "cubicBezierVertical"];

$tw.utils.each(curves, function(type) {
	smooths[type] = {enabled: true, type: type};
});

var strokes = {
	solid: false,
	dashed: true, // equivalent of [5,5] I believe
	dotted: [1, 4]
};

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

exports.properties = {
	edges: {
		// These two properties don't require special handling
		hidden: {type: "boolean", default: false},
		width: {type: "number", min: 0, default: 1, increment: 0.1},
		// "Arrows" actually accept any combination of those values. Plus this has many more options.
		// For backward compatibility, we accept a hidden " " property,
		// which used to be the old "no", until I realized what bad design
		// that was.
		arrows: {type: "enum", default: "to", values: [" ", "no", "to", "from", "middle"], hidden: [" "]},
		stroke: {type: "enum", values: ["solid", "dashed", "dotted"], default: "solid"},
		roundness: {type: "number", default: 0.5, min: 0, max: 1, increment: 0.01},
		label: {type: "string"},
		smooth: {type: "enum", default: "dynamic", values: ["no"].concat(curves)},
	}
};

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
				if (edge.arrows === " " || edge.arrows === "no") {
					edge.arrows = "";
				}
				if (edge.stroke) {
					edge.dashes = strokes[edge.stroke] || false;
					edge.stroke = undefined;
				} else if (old.dashes !== undefined) {
					edge.dashes = false;
				}
			}
		}
	}
};
