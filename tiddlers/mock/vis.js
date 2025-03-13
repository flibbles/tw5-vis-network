/*\

Mockups for vis-network. They simulate a Network and a DataSet.

\*/

var Network = function(element, objects, options) {
	this.invoke = {};
	exports.network = this;
	this.objects = objects;
	this.options = options
	this.element = element;
	// create a pretend canvas to insert
	this.wrapper = $tw.fakeDocument.createElement("div");
	this.wrapper.className = "vis-network";
	this.canvas = $tw.fakeDocument.createElement("canvas");
	this.wrapper.appendChild(this.canvas);
	// Vis-Network always blasts whatever already existed in the passed element
	element.children = [];
	element.appendChild(this.wrapper);
};

Network.prototype.on = function(name, method) {
	this.invoke[name] = method;
};

Network.prototype.setOptions = function(options) {
	this.options = options;
};

exports.Network = Network;

var DataSet = function(array, options) {
	this.map = new Map();
	if (array) {
		add(this.map, array);
	}
	this.options = options;
	this.entries = Object.fromEntries(this.map);
};

DataSet.prototype.get = function(id) {
	return this.map.get(id);
};

DataSet.prototype.update = function(array) {
	update(this.map, array);
};

DataSet.prototype.add = function(array) {
	add(this.map, array);
};

DataSet.prototype.remove = function(array) {
	if (!Array.isArray(array)) {
		array = [array];
	}
	for (var x = 0; x < array.length; x++) {
		this.map.delete(array[x].id);
	}
};

DataSet.prototype.flush = function() {
	this.entries = Object.fromEntries(this.map);
};

function add(map, array) {
	if (!Array.isArray(array)) {
		array = [array];
	}
	for (var x = 0; x < array.length; x++) {
		var item = array[x];
		if (map.has(item.id)) {
			throw new Error("Cannot add item");
		}
		map.set(item.id, item);
	}
};

function update(map, array) {
	if (!Array.isArray(array)) {
		array = [array];
	}
	for (var x = 0; x < array.length; x++) {
		var item = array[x];
		var existing = map.get(item.id);
		if (existing) {
			item = { ...existing, ...item };
		}
		map.set(item.id, item);
	}
};

exports.DataSet = DataSet;
