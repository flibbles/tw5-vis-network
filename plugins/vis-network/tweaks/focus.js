/*

Handles the focusing and blurring of the graph canvas.

Not actually a vis thing. We put this behavior in ourselves.

*/

"use strict";

exports.name = "focus";

exports.init = function(visNetwork, objects) {
	visNetwork.canvas.frame.addEventListener("focus", this);
	visNetwork.canvas.frame.addEventListener("blur", this);

	// handles both focus and blur events that occur to the canvas frame
	this.handleEvent = handleFocusAndBlur;
};

exports.process = function(objects, changes) {
	if (changes.graph) {
		changes.graph.focus = undefined;
		changes.graph.blur = undefined;
	}
};

function handleFocusAndBlur(event) {
	this.onevent({
		type: event.type,
		objectType: "graph",
		event: event
	});
};
