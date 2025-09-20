"use strict";

var preamble = "data:image/png;base64,";

exports.name = "graph-export-png";

exports.parameters = {
	targetTiddler: {type: "string"},
};

exports.handle = function(message, params) {
	if (params.targetTiddler) {
		this.wiki.addTiddler({
			title: params.targetTiddler,
			type: "image/png",
			text: getCanvas(this.canvasElement)
		});
	}
};


function getCanvas(canvas) {
	var data = canvas.toDataURL('image/png');
	if ($tw.utils.startsWith(data, preamble)) {
		data = data.substr(preamble.length);
	}
	return data;
};
