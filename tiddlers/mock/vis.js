/*\

Mockups for vis-network. They simulate a Network and a DataSet.

\*/

var Network = function(element, objects, options) {
	this.invoke = {};
	exports.network = this;
	this.objects = objects;
	this.options = options
};

Network.prototype.on = function(name, method) {
	this.invoke[name] = method;
};

exports.Network = Network;

var DataSet = function(array, options) {
	this.map = new Map();
	if (array) {
		update(this.map, array);
	}
	this.options = options;
	this.entries = Object.fromEntries(this.map);
};

DataSet.prototype.update = function(array) {
	update(this.map, array);
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

function update(map, array) {
	if (!Array.isArray(array)) {
		array = [array];
	}
	for (var x = 0; x < array.length; x++) {
		map.set(array[x].id, array[x]);
	}
};

exports.DataSet = DataSet;
