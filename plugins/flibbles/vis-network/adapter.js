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
	this.nodes = new Vis.DataSet(nodes);
	this.edges = new Vis.DataSet(edges);
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

VisAdapter.prototype.modify = function(nodes, edges) {
	var self = this;
	$tw.utils.each(nodes, function(node) {
		self.nodes.add(node);
	});
	$tw.utils.each(edges, function(edge) {
		self.edges.add(edge);
	});
};
