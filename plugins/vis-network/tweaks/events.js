/*

Manages the contrast of font colors when inside its shape.

*/

"use strict";

exports.name = "events";

exports.init = function(visNetwork) {
	var self = this;
	//this.vis.on("click", function(params) { });
	visNetwork.on("doubleClick", function(params) {
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
	visNetwork.on("dragStart", function(params) {
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
	visNetwork.on("dragEnd", function(params) {
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
	visNetwork.on("hoverNode", function(params) {
		self.onevent({
			type: "hover",
			objectType: "nodes",
			id: params.node,
			event: params.event,
		}, variablesFromInputParams(params));
	});
	visNetwork.on("blurNode", function(params) {
		self.onevent({
			type: "blur",
			objectType: "nodes",
			id: params.node,
			event: params.event
		}, {});
	});
};

exports.process = function(object, changes) {
	if (changes.graph && changes.graph.doubleclick) {
		changes.graph.doubleclick = undefined;
	}
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
