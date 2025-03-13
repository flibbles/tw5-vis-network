/*\
title: $:/plugins/flibbles/vis-network/adapter.js
type: application/javascript
module-type: graphengine

This is an adapter that the graph plugin uses to interface with vis-network.
This allows flibbles/graph to alternatively use this library.

\*/

"use strict";

exports.Vis = require("./vis.js");
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
		manipulation: {type: "boolean", default: false},
		addNode: {type: "actions", variables: ["x", "y"]},
		addEdge: {type: "actions", variables: ["fromTiddler", "toTiddler"]}
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
		fontColor: {type: "color", default: "#343434"}
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
		nodeColor: {path: ["nodes", "color"]},
		fontColor: {path: ["nodes", "font", "color"]},
		manipulation: {path: ["manipulation", "enabled"]},
		addNode: {path: ["manipulation", "addNode"]},
		addEdge: {path: ["manipulation", "addEdge"]}
	},
	nodes: {
		fontColor: {path: ["font", "color"]},
		tweaks: function (node, objects) {
			var globalColor = objects.graph && objects.graph.nodeColor;
			if (shapesWithInternalText[node.shape] === true
			&& node.label
			&& (node.color || globalColor)
			&& (!node.font || !node.font.color)) {
				node.font = node.font || {};
				var fontColor = $tw.macros.contrastcolour.run(
					node.color || "",
					globalColor || "#D2E5FF",
					"#000000", "#ffffff");
				node.font.color = fontColor;
			}
		}
	},
	edges: {
		tweaks: function(edge) {
			if (edge.label == null) {
				edge.label = "\0";
			}
		}
	}
};

function generateOptions(adapter, graph) {
	var options = {
		interaction: {
			hover: true
		},
		nodes: {
			shape: "dot",
			font: {}
		}
	};
	if (graph) {
		translate(options, graph, propertyMap.graph);
		for (var name in graphTweaks) {
			graphTweaks[name].call(adapter, {graph: options});
		}
	}
	return options;
};

exports.init = function(element, objects) {
	this.element = element;
	this.nodes = makeDataSet(objects.nodes, propertyMap.nodes, objects)
	this.edges = makeDataSet(objects.edges, propertyMap.edges, objects)
	var data = {
		nodes: this.nodes,
		edges: this.edges
	};
	var self = this;
	// We remember what children were already attached to the element, because they MUST remain. The TW widget stack requires the DOM to be what it made it.
	// Also, use .childNodes, not .children. The latter misses text nodes
	var children = Array.prototype.slice.call(element.childNodes);
	// First `Orb` is just a namespace of the JS package 
	this.vis = new exports.Vis.Network(element, data, generateOptions(this, objects.graph));

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
	modifyDataSet(this.nodes, objects.nodes, propertyMap.nodes, objects);
	modifyDataSet(this.edges, objects.edges, propertyMap.edges, objects);
	if (objects.graph) {
		this.vis.setOptions(generateOptions(this, objects.graph));
	}
};

exports.destroy = function() {
	this.vis.destroy();
};

function makeDataSet(objects, rules, allObjects) {
	var array = [];
	if (objects) {
		for (var id in objects) {
			var object = translate({id: id}, objects[id], rules);
			if (rules.tweaks) {
				rules.tweaks.call(this, object, allObjects);
			}
			array.push(object);
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

function modifyDataSet(dataSet, objects, rules, allObjects) {
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
				if (rules.tweaks) {
					rules.tweaks.call(this, newObj, allObjects);
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


var shapesWithInternalText = {
	ellipse: true,
	circle: true,
	database: true,
	box: true
};
