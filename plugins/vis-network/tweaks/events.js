/*

Manages the contrast of font colors when inside its shape.

*/

"use strict";

exports.name = "events";

exports.process = function(object, changes) {
	if (changes.graph && changes.graph.doubleclick) {
		changes.graph.doubleclick = undefined;
	}
};
