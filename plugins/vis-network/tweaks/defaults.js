/*

Installs defaults for first object.

*/

"use strict";

var options = {
	interaction: {
		hover: true
	},
	nodes: {
		shape: "dot",
		font: {}
	},
	edges: {
		arrows: "to"
	}
};

exports.defaults = function(objects, changes) {
	if (!objects.graph) {
		if (!changes.graph) {
			changes.graph = {};
		}
		set(changes.graph, options);
	}
};

function set(target, input) {
	for (var def in input) {
		if (typeof input[def] === "object") {
			target[def] = target[def] || {};
			set(target[def], input[def]);
		} else {
			target[def] = input[def];
		}
	}
};
