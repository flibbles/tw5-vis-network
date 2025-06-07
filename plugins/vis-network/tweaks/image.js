/*

Manages images in nodes.

*/

"use strict";

exports.image = function(objects, changes) {
	if (changes.nodes) {
		for (var id in changes.nodes) {
			var node = changes.nodes[id];
			if (node.image) {
				node.shape = "image";
			} else if (node.circularImage) {
				node.shape = "circularImage";
				node.image = node.circularImage;
				node.circularImage = undefined;
			} else {
				if (node.shape === "image" || node.shape === "circularImage") {
					node.shape = undefined;
				}
			}
		}
	}
};
