/*

Installs the ids into all the objects.

*/

"use strict";

exports.name = "id";

exports.process = function(objects, changes) {
	for (var type in changes) {
		// Assign the ids to each non-graph object
		if (type !== "graph") {
			var set = changes[type];
			for (var id in set) {
				var object = set[id];
				if (object !== null) {
					object.id = id;
				}
			}
		}
	}
};
