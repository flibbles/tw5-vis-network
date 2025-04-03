/*

Manages the contrast of font colors when inside its shape.

*/

"use strict";

exports.events = function(object, changes) {
	if (changes.graph && changes.graph.doubleclick) {
		changes.graph.doubleclick = undefined;
	}
};
