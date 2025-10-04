/*

Handles the focusing, blurring, and dropping of the graph canvas.

Not actually a vis thing. We put this behavior in ourselves.

*/

"use strict";

exports.name = "canvas";

exports.properties = {
	graph: {
		focus: {type: "actions"},
		blur: {type: "actions"},
		drop: {type: "actions", variables: ["dropTiddler"]}
	}
};

exports.init = function(visNetwork) {
	visNetwork.canvas.frame.addEventListener("focus", this);
	visNetwork.canvas.frame.addEventListener("blur", this);
	visNetwork.canvas.frame.addEventListener("drop", this);
	visNetwork.canvas.frame.addEventListener("dragover", this);

	// handles both focus and blur events that occur to the canvas frame
	this.handleEvent = handleFocusAndBlur;
};

exports.destroy = function(visNetwork) {
	this.vis.canvas.frame.removeEventListener("focus", this);
	this.vis.canvas.frame.removeEventListener("blur", this);
	this.vis.canvas.frame.removeEventListener("drop", this);
	this.vis.canvas.frame.removeEventListener("dragover", this);
};

exports.process = function(objects, changes) {
	if (changes.graph) {
		changes.graph.focus = undefined;
		changes.graph.blur = undefined;
		changes.graph.drop = undefined;
	}
};

function handleFocusAndBlur(event) {
	var self = this;
	switch (event.type) {
		case "drop":
			// Warning: Stopping before this line in the debugger causes
			// event.dataTransfer to be null in Firefox.
			var dataTransfer = event.dataTransfer;
			$tw.utils.importDataTransfer(event.dataTransfer, null, function(fieldsArray) {
				fieldsArray.forEach(function(fields) {
					self.onevent({
						type: "drop",
						objectType: "graph",
						event: event
					}, {dropTiddler: fields.title || fields.text});
				});
			});
			event.preventDefault();
			// Without stopPropagation, TW may try to "import" the dragged item
			event.stopPropagation();
		break;
		case "dragover":
			// Apparently this is necessary to make sure drop events trigger.
			event.preventDefault();
		break;
		default: // focus || blur
			this.onevent({
				type: event.type,
				objectType: "graph",
				event: event
			});
	}
};
