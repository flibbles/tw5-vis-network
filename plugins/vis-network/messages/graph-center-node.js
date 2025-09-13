"use strict";

exports.name = "graph-center-node";

exports.parameters = {
	id: {type: "string"},
	scale: {type: "number"}
};

exports.handle = function(message, params) {
	if (params.id) {
		var settings = {}
		if (params.scale !== undefined) {
			settings.scale = params.scale;
		}
		settings.animation = true;
		this.vis.focus(params.id, settings);
	}
};
