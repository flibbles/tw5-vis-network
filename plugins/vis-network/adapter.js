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
	nodes: {
		color: {type: "color"},
		colorSelected: {type: "color"},
		borderColor: {type: "color"},
		borderWidth: {type: "number", default: 1},
		label: {type: "string"},
		shape: {type: "enum", values: ["box", "circle", "circularImage", "diamond", "database", "dot", "ellipse", "hexagon", "icon", "image", "square", "star", "text", "triangle", "triangleDown"]},
		size: {type: "number", min: 0, default: 25}
	},
	edges: {
		arrows: {type: "enum", values: ["to", "from", "middle"]}, // This actually accept any combination of those values. Plus this has many more options.
		color: {type: "color"},
		dashes: {type: "boolean", default: false},
		hidden: {type: "boolean", default: false},
		label: {type: "string"},
		physics: {type: "boolean", default: true},
		width: {type: "number", default: 1}
	}
};

var propertyMap = {
	color: {
		border: "borderColor",
		highlight: "colorSelected"
	}
};


function generateOptions(style) {
	var options = {
		physics: {
			enabled: false
		},
		interaction: {
			hover: true
		},
		nodes: {
			shape: "dot",
			font: {}
		}
	};
	if (style) {
		style.nodes.color = style.nodeBackground;
		style.nodes.font.color = style.nodeForeground;
	}
};

exports.init = function(element, objects) {
	this.element = element;
	var arrays = translate(objects);
	this.nodes = makeDataSet(objects.nodes)
	this.edges = makeDataSet(objects.edges)
	var data = {
		nodes: this.nodes,
		edges: this.edges
	};
	var self = this;
	// We remember what children were already attached to the element, because they MUST remain. The TW widget stack requires the DOM to be what it made it.
	// Also, use .childNodes, not .children. The latter misses text nodes
	var children = Array.prototype.slice.call(element.childNodes);
	// First `Orb` is just a namespace of the JS package 
	this.vis = new exports.Vis.Network(element, data, generateOptions(objects.style));

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
	modifyDataSet(this.nodes, objects.nodes, this.properties.nodes);
	modifyDataSet(this.edges, objects.edges, this.properties.edges);
	if (objects.style) {
		this.vis.setOptions(generateOptions(objects.style));
	}
};

function makeDataSet(objects) {
	var array = [];
	if (objects) {
		for (var id in objects) {
			array.push(translate(objects[id], id));
		}
	}
	return new exports.Vis.DataSet(array, {queue: true});
};

function translate(object, id, rules) {
	if (object !== null) {
		object.id = id;
		return object;
	}
	return null
};

function modifyDataSet(dataSet, objects, rules) {
	if (objects) {
		var changed = false;
		for (var id in objects) {
			var object = objects[id];
			if (object === null) {
				dataSet.remove({id: id});
			} else {
				dataSet.update(translate(object, id));
			}
			changed = true;
		}
		if (changed) {
			dataSet.flush();
		}
	}
};
