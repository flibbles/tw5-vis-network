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
We expose these objects like this so the testing framework can get in.
*/
exports.Vis = function() {
	return VisLibrary;
};

exports.window = function() {
	return window;
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
		springConstant: {type: "number", min: 0, max: 0.2, increment: 0.01, default: 0.04},
		maxVelocity: {type: "number", min: 1, default: 50, max: 100},
		hideControls: {type: "boolean", default: false, description: "Hide node and edge manipulation controls by default"},
		addNode: {type: "actions", variables: ["x", "y"]},
		addEdge: {type: "actions", variables: ["fromTiddler", "toTiddler"]},
		doubleclick: {type: "actions", variables: ["x", "y", "xView", "yView"]},
		navigation: {type: "boolean"},
		hierarchy: {type: "boolean", default: false},
		hierarchyDirection: {type: "enum", default: "UD", values: ["UD", "DU", "LR", "RL"]},
		hierarchyNodeSpacing: {type: "number", default: 100, min: 0, max:200},
		zoom: {type: "boolean", default: true},
		focus: {type: "actions"},
		blur: {type: "actions"},
		background: {type: "image"}
		//hierarchyShakeTowards: {type: "enum", default: "leaves", values: ["leaves", "roots"]},
		//hierarchyParentCentralization: {type: "boolean", default: true},
		//hierarchySortMethod: {type: "enum", default: "hubsize", values: ["hubsize", "directed"]},
	},
	nodes: {
		x: {type: "number"},
		y: {type: "number"},
		color: {type: "color", default: "#D2E5FF"},
		borderWidth: {type: "number", min: 0, default: 1, increment: 0.1},
		borderColor: {type: "color", default: "#2B7CE9"},
		label: {type: "string"},
		shape: {type: "enum", values: ["box", "circle", /*"circularImage",*/ "diamond", "database", "dot", "ellipse", "hexagon", "icon", /*"image",*/ "square", "star", "text", "triangle", "triangleDown"]},
		image: {type: "image"},
		circularImage: {type: "image"},
		size: {type: "number", min: 0, default: 25},
		physics: {type: "boolean", default: true},
		fontColor: {type: "color", default: "#343434"},
		delete: {type: "actions", variables: []},
		edit: {type: "actions", variables: []},
		doubleclick: {type: "actions", variables: ["x", "y", "xView", "yView"]},
		hover: {type: "actions", variables: ["x", "y", "xView", "yView"]},
		blur: {type: "actions"},
		drag: {type: "actions", variables: ["x", "y"]},
		free: {type: "actions", variables: ["x", "y"]}
	},
	edges: {
		arrows: {type: "enum", default: "to", values: [" ", "to", "from", "middle"]}, // This actually accept any combination of those values. Plus this has many more options.
		color: {type: "color"},
		dashes: {type: "boolean", default: false},
		hidden: {type: "boolean", default: false},
		label: {type: "string"},
		physics: {type: "boolean", default: true},
		smooth: {type: "enum", default: "dynamic", values: ["no", "dynamic", "continuous", "discrete", "diagonalCross", "straightCross", "horizontal", "vertical", "curvedCW", "curvedCCW", "cubicBezier", "cubicBezierHorizontal", "cubicBezierVertical"]},
		roundness: {type: "number", default: 0.5, min: 0, max: 1, increment: 0.01},
		width: {type: "number", min: 0, default: 1, increment: 0.1},
		delete: {type: "actions"},
		doubleclick: {type: "actions", variables: ["x", "y", "xView", "yView"]}
	}
};

var propertyMap = {
	graph: {
		hierarchical: {path: ["layout", "hierarchical"]},
		focus: {path: []},
		blur: {path: []}
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
	this.vis.canvas.frame.addEventListener("focus", this);
	this.vis.canvas.frame.addEventListener("blur", this);

	// We MUST preserve any elements already attached to the passed element.
	for (var i = 0; i < children.length; i++) {
		element.appendChild(children[i]);
	}

	//this.vis.on("click", function(params) {
	//});
	this.vis.on("doubleClick", function(params) {
		var data = {
			type: "doubleclick",
			event: params.event.pointers[0],
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

	this.vis.on("beforeDrawing", function(canvas) {
		if (self.backgroundImage) {
			var image = self.backgroundImage;
			canvas.drawImage(image, -image.width/2, -image.height/2);
		}
	});
	this.vis.on("dragStart", function(params) {
		if (params.nodes.length > 0) {
			var data = {
				type: "drag",
				objectType: "nodes",
				id: params.nodes[0],
				event: params.event
			};
			var nodePosition = this.getPosition(params.nodes[0]);
			nodePosition.x = round(nodePosition.x);
			nodePosition.y = round(nodePosition.y);
			self.onevent(data, nodePosition);
		}
	});
	this.vis.on("dragEnd", function(params) {
		if (params.nodes.length > 0) {
			var data = {
				type: "free",
				objectType: "nodes",
				id: params.nodes[0],
				event: params.event
			};
			var nodePosition = this.getPosition(params.nodes[0]);
			nodePosition.x = round(nodePosition.x);
			nodePosition.y = round(nodePosition.y);
			self.onevent(data, nodePosition);
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
		}, {});
	});
};

function round(number) {
	return Math.round(number * 10) / 10;
};

function variablesFromInputParams(params) {
	return {
		x: round(params.pointer.canvas.x),
		y: round(params.pointer.canvas.y),
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
	this.vis.canvas.frame.removeEventListener("focus", this);
	this.vis.canvas.frame.removeEventListener("blur", this);
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

// handles both focus and blur events that occur to the canvas frame
exports.handleEvent = function(event) {
	this.onevent({
		type: event.type,
		objectType: "graph",
		event: event
	});
};

function translate(output, properties, rules) {
	for (var property in properties) {
		var mapping = rules[property];
		var dest = output;
		if (mapping && mapping.path) {
			var i = 0;
			if (mapping.path.length > 0) {
				for (; i < mapping.path.length-1; i++) {
					var dir = mapping.path[i];
					dest[dir] = dest[dir] || {};
					dest = dest[dir];
				}
				dest[mapping.path[i]] = properties[property];
			}
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
				diff[property] = createDiff((typeof oldValue === "object" && oldValue !== null)? oldValue: {}, newValue);
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
