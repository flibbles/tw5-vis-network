/*

Manages images in nodes.

*/

"use strict";

exports.name = "image";

exports.process = function(objects, changes) {
	if (changes.nodes) {
		for (var id in changes.nodes) {
			var node = changes.nodes[id];
			if (node) {
				if (node.image) {
					node.shape = node.circular? "circularImage": "image";
					node.circular = undefined;
				} else {
					if (node.shape === "image" || node.shape === "circularImage") {
						node.shape = undefined;
					}
				}
			}
		}
	}
};
