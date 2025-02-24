/*\
title: $:/plugins/flibbles/vis-network/dictionary.js
type: application/javascript
module-type: library

This categorizes all the available properties, and manages translating them
between TW5-graph's flat properties to  the hierarchy Vis-network uses.

\*/

"use strict";

exports.properties = {
	nodes: {
		color: {type: "color"},
		colorSelected: {type: "color"},
		borderColor: {type: "color"},
		borderWidth: {type: "number", default: 1},
		label: {type: "string"},
		shape: {type: "enum", values: ["box", "circle", "circularImage", "diamond", "database", "dot", "ellipse", "hexagon", "icon", "image", "square", "star", "text", "triangle", "triangleDown"]},
		size: {type: "number", min: 0, default: 25}
	},
	edges: {
		arrows: {type: "enum", values: ["to", "from", "middle"]}, // This actually accept any combination of those values. Plus this has many more options.
		color: {type: "color"},
		dashes: {type: "boolean", default: false},
		hidden: {type: "boolean", default: false},
		label: {type: "string"},
		physics: {type: "boolean", default: true},
		width: {type: "number", default: 1}
	}
};

var propertyMap = {
	color: {
		border: "borderColor",
		highlight: "colorSelected"
	}
};

exports.translate = function(objects) {
	var output = {};
	for (var type in objects) {
		var array = [];
		var set = objects[type];
		for (var id in set) {
			var object = set[id];
			if (object !== null) {
				object.id = id;
				array.push(object);
			} else {
				array.push(id);
			}
		}
		output[type] = array;
	}
	return output;
};
