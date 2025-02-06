/*\
title: $:/plugins/flibbles/vis-network/adapter.js
type: application/javascript
module-type: graphengineadapter

This is an adapter that the graph plugin uses to interface with vis-network.
This allows flibbles/graph to alternatively use this library.

\*/

"use strict";


if ($tw.browser) {
	// Only install this adapter if we're on the browser. Doesn't work in Node.
	var Vis = require("./vis.js");
	exports.Vis = VisAdapter;
}

function VisAdapter(wiki) { };

function generateOptions(style) {
	return {
		physics: {
			enabled: false
		},
		interaction: {
			hover: true
		},
		nodes: {
			shape: "dot",
			color: style.nodeBackground,
			font: {
				color: style.nodeForeground
			}
		}
	};
};

VisAdapter.prototype.initialize = function(element, objects) {
	this.element = element;
	this.nodes = convertToDataSet(objects.nodes);
	this.edges = convertToDataSet(objects.edges);
	var data = {
		nodes: this.nodes,
		edges: this.edges
	};
	var self = this;
	// We remember what children were already attached to the element, because they MUST remain. The TW widget stack requires the DOM to be what it made it.
	var children = Array.prototype.slice.call(element.children);
	// First `Orb` is just a namespace of the JS package 
	this.vis = new Vis.Network(element, data, generateOptions(objects.style));

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

VisAdapter.prototype.setPhysics = function(value) {
};

VisAdapter.prototype.render = function() {
};

VisAdapter.prototype.update = function(objects) {
	modifyDataSet(this.nodes, objects.nodes);
	modifyDataSet(this.edges, objects.edges);
	if (objects.style) {
		this.vis.setOptions(generateOptions(objects.style));
	}
};

function modifyDataSet(dataSet, objects) {
	if (objects) {
		var changed = false;
		for (var id in objects) {
			var object = objects[id];
			if (object === null) {
				dataSet.remove({id: id});
			} else {
				object.id = id;
				dataSet.update(object);
			}
			changed = true;
		}
		if (changed) {
			dataSet.flush();
		}
	}
};

function convertToDataSet(object) {
	var array = [];
	if (object) {
		for(var id in object) {
			var entry = object[id];
			entry.id = id;
			array.push(entry);
		}
	}
	return new Vis.DataSet(array, {queue: true});
};
