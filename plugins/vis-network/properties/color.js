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

exports.name = "color";

exports.process = function(objects, changes) {
	var graph = changes.graph;
	if (graph) {
		if (graph.nodeColor) {
			graph.nodes = graph.nodes || {};
			graph.nodes.color = graph.nodeColor;
			graph.nodeColor = undefined;
		}
		if (graph.fontColor) {
			graph.nodes = graph.nodes || {};
			graph.nodes.font = {
				color: graph.fontColor
			};
			graph.edges = graph.edges || {font: {align: "horizontal"}};
			graph.edges.font.color = graph.fontColor;
			graph.fontColor = undefined;
		}
		if (graph.graphColor) {
			graph.edges = graph.edges || {font: {align: "horizontal"}};
			graph.edges.font.strokeColor = graph.graphColor;
			graph.graphColor = undefined;
		}
	}
	if (changes.nodes) {
		var globalColor = (changes.graph && changes.graph.nodes && changes.graph.nodes.color) || (objects.graph && objects.graph.nodeColor);
		if (!globalColor && objects.graph) {
			// The color isn't being set. Maybe it was already set.
			globalColor = objects.graph.nodes && objects.graph.nodes.color;
		}
		for (var id in changes.nodes) {
			// Set contrast color for the font, if necessary
			var node = changes.nodes[id];
			if (node) {
				setFontColor(node, globalColor);
				setNodeColor(node, globalColor, objects.nodes && objects.nodes[id]);
			}
			// Set a border color if necessary
		}
	}
};

function setFontColor(node, globalColor) {
	if (node.fontColor) {
		node.font = node.font || {};
		node.font.color = node.fontColor;
		node.fontColor = undefined;
	} else if (shapesWithInternalText[node.shape] === true
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
};

function setNodeColor(node, globalColor, object) {
	if (node.borderColor) {
		var background = node.color;
		if (!background && object && typeof object.color === "object") {
			// This is a work-around for a vis-network bug where background
			// color cannot be unset while more specific colorings exist.
			background = globalColor;
		}
		node.color = {
			border: node.borderColor,
			highlight: {background: background, border: node.borderColor},
			hover: {background: background, border: node.borderColor},
			background: background
		};
		node.borderColor = undefined;
	}
};
