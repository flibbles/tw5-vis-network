/*\
title: $:/plugins/flibbles/vis-network/adapter.js
type: application/javascript
module-type: graphengine

This is an adapter that the graph plugin uses to interface with vis-network.
This allows flibbles/graph to alternatively use this library.

\*/

"use strict";

var VisLibrary = require("./vis.js");

/*
We expose it like this so the testing framework can get in.
*/
exports.Vis = function() {
	return VisLibrary;
};

// Tweaks are to perform very specific operations to the incoming data before
// passing it along to vis.
// Partly to account for differences in API.
// Partly to account for all the bugs in vis-network.
var graphTweaks = $tw.modules.applyMethods("vis-tweak");

exports.name = "Vis-Network";
//exports.platforms = ["browser"];

exports.properties = {
	graph: {
		physics: {type: "boolean", default: true},
		addNode: {type: "actions", variables: ["x", "y"]},
		addEdge: {type: "actions", variables: ["fromTiddler", "toTiddler"]},
		doubleclick: {type: "actions", variables: ["x", "y", "xView", "yView"]}
	},
	nodes: {
		x: {type: "number", hidden: true},
		y: {type: "number", hidden: true},
		color: {type: "color", default: "#D2E5FF"},
		borderWidth: {type: "number", min: 0, default: 1, increment: 0.1},
		label: {type: "string"},
		shape: {type: "enum", values: ["box", "circle", "circularImage", "diamond", "database", "dot", "ellipse", "hexagon", "icon", "image", "square", "star", "text", "triangle", "triangleDown"]},
		size: {type: "number", min: 0, default: 25},
		physics: {type: "boolean", default: true},
		fontColor: {type: "color", default: "#343434"},
		delete: {type: "actions", variables: []},
		edit: {type: "actions", variables: []},
		hover: {type: "actions", variables: ["x", "y", "xView", "yView"]},
		blur: {type: "actions"},
		drag: {type: "actions", variables: ["x", "y", "xView", "yView"]},
		doubleclick: {type: "actions", variables: ["x", "y", "xView", "yView"]}
	},
	edges: {
		arrows: {type: "enum", values: ["to", "from", "middle"]}, // This actually accept any combination of those values. Plus this has many more options.
		color: {type: "color"},
		dashes: {type: "boolean", default: false},
		hidden: {type: "boolean", default: false},
		label: {type: "string"},
		physics: {type: "boolean", default: true},
		smooth: {type: "boolean", default: true},
		width: {type: "number", min: 0, default: 1, increment: 0.1},
		delete: {type: "actions"},
		doubleclick: {type: "actions", variables: ["x", "y", "xView", "yView"]}
	}
};

var propertyMap = {
	graph: {
		hierarchical: {path: ["layout", "hierarchical"]},
		physics: {path: ["physics", "enabled"]}
	},
	nodes: {},
	edges: {}
};

exports.init = function(element, objects) {
	var Vis = exports.Vis();
	this.element = element;
	this.objects = {};
	var newObjects = this.processObjects(objects);
	this.dataSets = {
		nodes: new Vis.DataSet(Object.values(newObjects.nodes || {}).map((x) => createDiff({}, x)), {queue: true}),
		edges: new Vis.DataSet(Object.values(newObjects.edges || {}).map((x) => createDiff({}, x)), {queue: true})
	};
	var self = this;
	// We remember what children were already attached to the element, because they MUST remain. The TW widget stack requires the DOM to be what it made it.
	// Also, use .childNodes, not .children. The latter misses text nodes
	var children = Array.prototype.slice.call(element.childNodes);
	// First `Orb` is just a namespace of the JS package 
	this.vis = new Vis.Network(element, this.dataSets, createDiff({}, newObjects.graph));

	// We MUST preserve any elements already attached to the passed element.
	for (var i = 0; i < children.length; i++) {
		element.appendChild(children[i]);
	}

	//this.vis.on("click", function(params) {
	//});
	this.vis.on("doubleClick", function(params) {
		var data = {
			type: "doubleclick",
			event: params.event,
		};
		// TODO: Meta keys
		if (params.nodes.length >= 1) {
			data.id = params.nodes[0];
			data.objectType = "nodes";
		} else if (params.edges.length >= 1) {
			data.id = params.edges[0];
			data.objectType = "edges";
		} else {
			data.objectType = "graph";
		}
		self.onevent(data, variablesFromInputParams(params));
	});

	this.vis.on("dragEnd", function(params) {
		if (params.nodes.length > 0) {
			var data = {
				type: "drag",
				objectType: "nodes",
				id: params.nodes[0],
				event: params.event
			};
			self.onevent(data, variablesFromInputParams(params));
		}
	});
	this.vis.on("hoverNode", function(params) {
		self.onevent({
			type: "hover",
			objectType: "nodes",
			id: params.node,
			event: params.event,
		}, variablesFromInputParams(params));
	});
	this.vis.on("blurNode", function(params) {
		self.onevent({
			type: "blur",
			objectType: "nodes",
			id: params.node,
			event: params.event
		}, variablesFromInputParams(params));
	});
};

function variablesFromInputParams(params) {
	return {
		x: params.pointer.canvas.x,
		y: params.pointer.canvas.y,
		xView: params.pointer.DOM.x,
		yView: params.pointer.DOM.y};
};

exports.update = function(objects) {
	var changes = this.processObjects(objects);
	for (var type in changes) {
		if (type === "graph") {
			this.vis.setOptions(createDiff({}, changes.graph));
		} else {
			var dataSet = this.dataSets[type];
			for (var id in changes[type]) {
				var object = changes[type][id];
				if (object === null) {
					dataSet.remove({id: id});
				} else {
					var oldObj = dataSet.get(id) || {};
					dataSet.update(createDiff(oldObj, object));
				}
			}
			dataSet.flush();
		}
	}
};

exports.destroy = function() {
	this.vis.destroy();
};

exports.processObjects = function(objects) {
	var changes = {};
	for (var type in objects) {
		var rules = propertyMap[type];
		changes[type] = Object.create(null);
		if (type === "graph") {
			translate(changes.graph, objects.graph, rules);
		} else {
			var set = objects[type];
			for (var id in set) {
				var object = set[id];
				var newObj;
				if (object === null) {
					newObj = null;
				} else {
					newObj = translate({id: id}, object, rules);
				}
				changes[type][id] = newObj;
			}
		}
	}
	for (var name in graphTweaks) {
		graphTweaks[name].call(this, this.objects, changes);
	}
	// Apply those changes to our own record.
	for (var type in changes) {
		if (type === "graph") {
			this.objects.graph = changes.graph;
		} else {
			this.objects[type] = this.objects[type] || Object.create(null);
			for (var id in changes[type]) {
				this.objects[type][id] = changes[type][id];
			}
		}
	}
	return changes;
};

function translate(output, properties, rules) {
	for (var property in properties) {
		var mapping = rules[property];
		var dest = output;
		if (mapping && mapping.path) {
			var i = 0;
			for (; i < mapping.path.length-1; i++) {
				var dir = mapping.path[i];
				dest[dir] = dest[dir] || {};
				dest = dest[dir];
			}
			dest[mapping.path[i]] = properties[property];
		} else {
			output[property] = properties[property];
		}
	}
	return output;
};

/*
Creates an object representing the differences between the old object and
the new objects. Because vis applies changes; it doesn't replace.
*/
function createDiff(oldObject, newObject) {
	var diff = Object.create(null);
	for (var property in newObject) {
		var newValue = newObject[property];
		if (newValue !== undefined) {
			if (typeof newValue === "object" && newValue !== null) {
				var oldValue = oldObject[property];
				diff[property] = createDiff(typeof oldValue === "object"? oldValue: {}, newValue);
			} else {
				diff[property] = newValue;
			}
		}
	}
	// Any properties that went missing must be flagged as deleted
	for (var property in oldObject) {
		if (newObject[property] === undefined) {
			diff[property] = null;
		}
	}
	return diff;
};
