/*

Miscellaneous node properties that don't need special handling.

*/

"use strict";

exports.names = "nodes";

exports.properties = {
	nodes: {
		borderWidth: {type: "number", min: 0, default: 1, increment: 0.1},
		label: {type: "string"},
		fixed: {type: "boolean", default: false},
		size: {type: "number", min: 0, default: 25},
		minWidth: {type: "number", min: 1, max: 500,
			description: "Minimum width of labels. Affects the size of nodes when labels are contained within"},
		maxWidth: {type: "number", min: 1, max: 500,
			description: "Maximum allowed width of labels. Affects the size of nodes when labels are contained within."}
	},
};

exports.process = function(objects, changes) {
	if (changes.nodes) {
		var oldNodes = (objects && objects.nodes) || {};
		for (var id in changes.nodes) {
			var node = changes.nodes[id];
			if (node) {
				if (node.minWidth !== undefined
				|| node.maxWidth !== undefined) {
					node.widthConstraint = {
						minimum: node.minWidth,
						maximum: node.maxWidth
					};
					node.minWidth = undefined;
					node.maxWidth = undefined;
				}
			}
		}
	}
};
