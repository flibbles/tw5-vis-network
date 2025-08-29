"use strict";

exports.name = "graph-zoom-to";

exports.parameters = {
	x: {type: "number"},
	y: {type: "number"},
	zoom: {type: "number"},
	ms: {type: "number"},
	easingFunction: {type: "enum", default: "linear", values: [
		"linear",
		"easeInQuad",
		"easeOutQuad",
		"easeInOutQuad",
		"easeInCubic",
		"easeOutCubic",
		"easeInOutCubic",
		"easeInQuart",
		"easeOutQuart",
		"easeInOutQuart",
		"easeInQuint",
		"easeOutQuint",
		"easeInOutQuint"
	]}
};

exports.handle = function(message, params) {
	var settings = {}
	if (params.x !== undefined && params.y !== undefined) {
		settings.position = { x: params.x, y: params.y };
	}
	if (params.zoom !== undefined) {
		var scale = this.vis.getScale();
		settings.scale = scale * parseFloat(params.zoom);
	}
	if (params.ms !== undefined) {
		settings.animation = {
				duration: parseFloat(params.time || 0),
				easingFunction: params.easeFunction || "linear"};
	}
	this.vis.moveTo(settings);
};
