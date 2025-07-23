/*

Manages images in nodes.

*/

"use strict";

exports.name = "background";

exports.process = function(objects, changes) {
	var self = this;
	if (changes.graph) {
		if (changes.graph.background
		&& (!this.backgroundImage || this.backgroundImage.src !== changes.graph.background)) {
			var window = this.window();
			var image = new window.Image();
			// We don't actually set the image as our background until after
			// it's had a chance to load. Not a big deal for tiddler images
			// but remote ones need this, and we can't tell the difference
			// from here.
			image.onload = function() {
				self.backgroundImage = image;
				// I don't think I need to redraw, but I might be wrong.
				self.vis.redraw();
			};
			image.src = changes.graph.background;
			changes.graph.background = undefined;
		} else {
			self.backgroundImage = undefined;
		}
	}
};
