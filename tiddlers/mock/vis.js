/*\

Mockups for vis-network. They simulate a Network and a DataSet.

\*/

var Network = function(element, objects, options) {
	this.invoke = {};
	exports.network = this;
	this.objects = objects;
};

Network.prototype.on = function(name, method) {
	this.invoke[name] = method;
};

exports.Network = Network;

var DataSet = function(array, options) {
	this.map = new Map();
	if (array) {
		this.update(array);
	}
	this.options = options;
	this.entries = Object.fromEntries(this.map);
};

DataSet.prototype.update = function(array) {
	if (!Array.isArray(array)) {
		array = [array];
	}
	for (var x = 0; x < array.length; x++) {
		this.map.set(array[x].id, array[x]);
	}
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

exports.DataSet = DataSet;
