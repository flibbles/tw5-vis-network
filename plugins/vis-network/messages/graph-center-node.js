"use strict";

exports.name = "graph-center-node";

exports.parameters = {
	tiddler: {type: "string"},
	scale: {type: "number"}
};

exports.handle = function(message, params) {
	if (params.tiddler) {
		var settings = {}
		if (params.scale !== undefined) {
			settings.scale = params.scale;
		}
		settings.animation = true;
		this.vis.focus(params.tiddler, settings);
	}
};
