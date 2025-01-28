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

function VisAdapter(element, nodes, edges) { };

VisAdapter.prototype.initialize = function(element, nodes, edges) {
	this.element = element;
	this.nodes = convertToDataSet(nodes);
	this.edges = convertToDataSet(edges);
	var data = {
		nodes: this.nodes,
		edges: this.edges
	};
	var options = {};
	// First `Orb` is just a namespace of the JS package 
	this.orb = new Vis.Network(element, data, options);
};

VisAdapter.prototype.setPhysics = function(value) {
};

VisAdapter.prototype.render = function() {
};

VisAdapter.prototype.update = function(nodes, edges) {
	modifyDataSet(this.nodes, nodes);
	modifyDataSet(this.edges, edges);
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
