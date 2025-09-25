/*

Manages images in nodes.

*/

"use strict";

exports.name = "image";

exports.properties = {
	nodes: {
		shape: {type: "enum", values: ["box", "circle", /*"circularImage",*/ "diamond", "database", "dot", "ellipse", "hexagon", /*"icon",*/ /*"image",*/ "square", "star", "text", "triangle", "triangleDown"]},
		image: {type: "image"},
			circular: {type: "boolean", parent: "image", default: false},
	}
};

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
