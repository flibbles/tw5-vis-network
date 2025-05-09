/*

Manages all the structure for graph manipulation.

*/

"use strict";

exports.position = function(objects, changes) {
	if (!this.position) {
		// We use this to store all positions that were given to us by TW5
		this.position = Object.create(null);
	}
	if (changes.nodes) {
		for (var id in changes.nodes) {
			var node = changes.nodes[id];
			if (node && (node.x || node.y)) {
				var posKey = node.x + "," + node.y;
				if (this.position[id] === posKey) {
					// This isn't a new position
					this.position[id] = posKey;
					var nodePosition = this.vis.getPosition(id);
					node.x = nodePosition.x;
					node.y = nodePosition.y;
				} else {
					this.position[id] = posKey;
				}
			}
		}
	}
};
