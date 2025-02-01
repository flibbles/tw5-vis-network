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

VisAdapter.prototype.initialize = function(element, objects) {
	this.element = element;
	this.nodes = convertToDataSet(objects.nodes);
	this.edges = convertToDataSet(objects.edges);
	var data = {
		nodes: this.nodes,
		edges: this.edges
	};
	var options = {
		physics: {
			enabled: false
		},
		interaction: {
			hover: true
		}
	};
	var self = this;
	// We remember what children were already attached to the element, because they MUST remain. The TW widget stack requires the DOM to be what it made it.
	var children = Array.prototype.slice.call(element.children);
	// First `Orb` is just a namespace of the JS package 
	this.vis = new Vis.Network(element, data, options);

	// We MUST preserve any elements already attached to the passed element.
	for (var i = children.length-1; i>=0; i--) {
		element.insertBefore(children[i], element.firstChild);
	}

	//this.vis.on("click", function(params) {
	//});
	this.vis.on("doubleClick", function(params) {
		// TODO: Meta keys
		if (params.nodes.length >= 1) {
			self.onevent({target: "node", id: params.nodes[0]});
		} else if (params.edges.length >= 1) {
			self.onevent({target: "edge", id: params.edges[0]});
		}
	});
};

VisAdapter.prototype.setPhysics = function(value) {
};

VisAdapter.prototype.render = function() {
};

VisAdapter.prototype.update = function(objects) {
	modifyDataSet(this.nodes, objects.nodes);
	modifyDataSet(this.edges, objects.edges);
};

function modifyDataSet(dataSet, objects) {
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
};

function convertToDataSet(object) {
	var array = [];
	for(var id in object) {
		var entry = object[id];
		entry.id = id;
		array.push(entry);
	}
	return new Vis.DataSet(array, {queue: true});
};
