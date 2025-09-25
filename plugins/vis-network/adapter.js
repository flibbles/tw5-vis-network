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

exports.name = "Vis-Network";
//exports.platforms = ["browser"];

/**
 * Set up all the properties here so it's accessable by TW5-Graph.
 *
 * Property Handlers perform specific operations to the incoming data before
 * passing it along to vis.
 * Partly to account for differences in API.
 * Partly to account for all the bugs in vis-network.
 */

var propertyHandlers = $tw.modules.getModulesByTypeAsHashmap("vis-property");
exports.properties = {};

for (var handler in propertyHandlers) {
	var module = propertyHandlers[handler];
	if (module.properties) {
		// This property handler has properties to declare. Fold them in.
		for (var category in module.properties) {
			exports.properties[category] = exports.properties[category] || Object.create(null);
			$tw.utils.extend(
				exports.properties[category],
				module.properties[category]);
		}
	}
}

exports.forEachProperty = function(methodName) {
	var args = Array.prototype.slice.call(arguments, 1);
	for (var name in propertyHandlers) {
		var method = propertyHandlers[name][methodName];
		method && method.apply(this, args);
	}
};

/**
 * Set up all the messages here so it's accessable by TW5-Graph.
 */

var Messages = $tw.modules.getModulesByTypeAsHashmap("vis-message");

exports.messages = Object.create(null);

for (var name in Messages) {
	exports.messages[name] = Messages[name].parameters || {};
}

exports.handleMessage = function(message, params) {
	var handler = Messages[message.type];
	if (handler) {
		return handler.handle.call(this, message, params);
	}
};

/**
 * Core methods for adapter
 */
exports.init = function(element, objects, options) {
	var Vis = exports.Vis();
	this.element = element;
	options = options || {};
	this.wiki = options.wiki || $tw.wiki;
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
	this.vis = new Vis.Network(element, this.dataSets, createDiff({}, newObjects.graph));

	// The first child of the frame should always be the canvas element.
	// I think we can just grab it blindly. Let's remember it.
	this.canvasElement = this.vis.canvas.frame.children[0];
	// We MUST preserve any elements already attached to the passed element.
	for (var i = 0; i < children.length; i++) {
		element.appendChild(children[i]);
	}
	this.forEachProperty("init", this.vis);
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
	this.forEachProperty("destroy", this.vis);
	this.vis.destroy();
};

exports.processObjects = function(changes) {
	this.forEachProperty("process", this.objects, changes);
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

/*
Creates an object representing the differences between the old object and
the new objects. Because vis applies changes; it doesn't replace.
*/
function createDiff(oldObject, newObject) {
	var diff = Object.create(null);
	for (var property in newObject) {
		var newValue = newObject[property];
		if (newValue !== undefined) {
			if (typeof newValue === "object"
			&& newValue !== null
			&& !Array.isArray(newValue)) {
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
