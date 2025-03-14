/*

Manages the contrast of font colors when inside its shape.

*/

"use strict";

var shapesWithInternalText = {
	ellipse: true,
	circle: true,
	database: true,
	box: true
};

exports.contrast = function(objects, changes) {
	if (changes.nodes) {
		var globalColor = (changes.graph && changes.graph.nodes && changes.graph.nodes.color) || (objects.graph && objects.graph.nodeColor);
		for (var id in changes.nodes) {
			var node = changes.nodes[id];
			if (node
			&& shapesWithInternalText[node.shape] === true
			&& node.label
			&& (node.color || globalColor)
			&& (!node.font || !node.font.color)) {
				node.font = node.font || {};
				var fontColor = $tw.macros.contrastcolour.run(
					node.color || "",
					globalColor || "#D2E5FF",
					"#000000", "#ffffff");
				node.font.color = fontColor;
			}
		}
	}
};
