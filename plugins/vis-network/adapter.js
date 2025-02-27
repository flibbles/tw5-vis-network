/*\
title: $:/plugins/flibbles/vis-network/adapter.js
type: application/javascript
module-type: graphengine

This is an adapter that the graph plugin uses to interface with vis-network.
This allows flibbles/graph to alternatively use this library.

\*/

"use strict";

exports.Vis = require("./vis.js");

exports.name = "Vis-Network";
//exports.platforms = ["browser"];

exports.properties = {
	graph: {
		physics: {type: "boolean", default: true}
	},
	nodes: {
		color: {type: "color"},
		borderWidth: {type: "number", min: 0, default: 1, increment: 0.1},
		label: {type: "string"},
		shape: {type: "enum", values: ["box", "circle", "circularImage", "diamond", "database", "dot", "ellipse", "hexagon", "icon", "image", "square", "star", "text", "triangle", "triangleDown"]},
		size: {type: "number", min: 0, default: 25},
		physics: {type: "boolean", default: true}
	},
	edges: {
		arrows: {type: "enum", values: ["to", "from", "middle"]}, // This actually accept any combination of those values. Plus this has many more options.
		color: {type: "color"},
		dashes: {type: "boolean", default: false},
		hidden: {type: "boolean", default: false},
		label: {type: "string"},
		physics: {type: "boolean", default: true},
		smooth: {type: "boolean", default: true},
		width: {type: "number", min: 0, default: 1, increment: 0.1}
	}
};

var propertyMap = {
	graph: {
		hierarchical: {path: ["layout", "hierarchical"]},
		physics: {path: ["physics", "enabled"]},
		nodeBackground: {path: ["nodes", "color"]},
		nodeForeground: {path: ["nodes", "font", "color"]}
	},
	nodes: {},
	edges: {
		label: {eraser: "\0"}
	}
};

function generateOptions(style) {
	var options = {
		interaction: {
			hover: true
		},
		nodes: {
			shape: "dot",
			font: {}
		}
	};
	if (style) {
		translate(options, style, propertyMap.graph);
	}
	return options;
};

exports.init = function(element, objects) {
	this.element = element;
	this.nodes = makeDataSet(objects.nodes, propertyMap.nodes)
	this.edges = makeDataSet(objects.edges, propertyMap.edges)
	var data = {
		nodes: this.nodes,
		edges: this.edges
	};
	var self = this;
	// We remember what children were already attached to the element, because they MUST remain. The TW widget stack requires the DOM to be what it made it.
	// Also, use .childNodes, not .children. The latter misses text nodes
	var children = Array.prototype.slice.call(element.childNodes);
	// First `Orb` is just a namespace of the JS package 
	this.vis = new exports.Vis.Network(element, data, generateOptions(objects.graph));

	// We MUST preserve any elements already attached to the passed element.
	for (var i = children.length-1; i>=0; i--) {
		element.insertBefore(children[i], element.firstChild);
	}

	//this.vis.on("click", function(params) {
	//});
	this.vis.on("doubleClick", function(params) {
		var data = {
			type: "doubleclick",
			event: params.event,
			point: params.pointer.canvas,
			viewPoint: params.pointer.DOM
		};
		// TODO: Meta keys
		if (params.nodes.length >= 1) {
			data.id = params.nodes[0];
			data.objectType = "nodes";
		} else if (params.edges.length >= 1) {
			data.id = params.edges[0];
			data.objectType = "edges";
		}
		self.onevent(data);
	});

	this.vis.on("dragEnd", function(params) {
		if (params.nodes.length > 0) {
			var data = {
				type: "drag",
				objectType: "nodes",
				id: params.nodes[0],
				event: params.event,
				point: params.pointer.canvas,
				viewPoint: params.pointer.DOM
			};
			self.onevent(data);
		}
	});
	this.vis.on("hoverNode", function(params) {
		self.onevent({
			type: "hover",
			objectType: "nodes",
			id: params.node,
			event: params.event,
			point: params.pointer.canvas,
			viewPoint: params.pointer.DOM});
	});
	this.vis.on("blurNode", function(params) {
		self.onevent({
			type: "blur",
			objectType: "nodes",
			id: params.node,
			event: params.event,
			point: params.pointer.canvas,
			viewPoint: params.pointer.DOM});
	});
};

exports.update = function(objects) {
	modifyDataSet(this.nodes, objects.nodes, propertyMap.nodes);
	modifyDataSet(this.edges, objects.edges, propertyMap.edges);
	if (objects.graph) {
		this.vis.setOptions(generateOptions(objects.graph));
	}
};

function makeDataSet(objects, rules) {
	var array = [];
	if (objects) {
		for (var id in objects) {
			array.push(translate({id: id}, objects[id], rules));
		}
	}
	return new exports.Vis.DataSet(array, {queue: true});
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

function modifyDataSet(dataSet, objects, rules) {
	if (objects) {
		var changed = false;
		for (var id in objects) {
			var object = objects[id];
			if (object === null) {
				dataSet.remove({id: id});
			} else {
				var newObj = translate({id: id}, object, rules)
				var oldObj = dataSet.get(id);
				if (oldObj) {
					// We need to explicitly turn off any lingering properties
					// that aren't supposed to be there anymore.
					scrubLingering(oldObj, newObj);
				}
				if (rules.label && rules.label.eraser && newObj.label == null) {
					newObj.label = '\0';
				}
				dataSet.update(newObj);
			}
			changed = true;
		}
		if (changed) {
			dataSet.flush();
		}
	}
};

function scrubLingering(oldObject, newObject) {
	for (var property in oldObject) {
		var newValue = newObject[property];
		if (newValue === undefined) {
			newObject[property] = null;
		} else if (typeof oldObject[property] === "object" && typeof newValue === "object") {
			scrubLingering(oldObject[property], newValue);
		}
	}
};
