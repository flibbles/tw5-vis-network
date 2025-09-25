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
	},
};
