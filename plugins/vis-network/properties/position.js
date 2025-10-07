/*

Manages all the positioning for nodes in graph manipulation.

*/

"use strict";

exports.name = "position";

exports.properties = {
	nodes: {
		x: {type: "number"},
		y: {type: "number"},
	}
};

exports.process = function(objects, changes) {
	if (!this.position) {
		// We use this to store all positions that were given to us by TW5
		this.position = Object.create(null);
	}
	if (changes.nodes) {
		for (var id in changes.nodes) {
			var node = changes.nodes[id];
			if (node) {
				if (node.x !== undefined || node.y !== undefined) {
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
				} else {
					// Node does not specify a location.
					// If one had existed, we should preserve its existing loc
					if (this.position[id] !== undefined) {
						var nodePosition = this.vis.getPosition(id);
						node.x = nodePosition.x;
						node.y = nodePosition.y;
						// We forget the old set location.
						// It's "free-floating" now
						// In the future, we will always record SOME position, even if it's
						// just what Vis already thinks it to be.
						// Otherwise we can suffer some nasty recursion exceptions of out Vis.
						this.position[id] = null;
					}
				}
			} else if (this.position[id] !== undefined) {
				// The node is being removed. Forget its initial position.
				// Or that we ever positioned it at all (null).
				this.position[id] = undefined;
			}
		}
	}
};
