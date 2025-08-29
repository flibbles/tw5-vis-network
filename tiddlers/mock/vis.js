/*\

Mockups for vis-network. They simulate a Network.

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
	// Now we install our own little custom event handler,
	// because the fake ones don't have one of their own.
	this.wrapper.listeners = {};
	this.wrapper.addEventListener = function(type, method) {
		this.listeners[type] = this.listeners[type] || [];
		this.listeners[type].push(method);
	};
	this.wrapper.dispatchEvent = function(event) {
		$tw.utils.each(this.listeners[event.type], (handler) => {
			if (typeof handler === "function") {
				handler(event);
			} else {
				handler.handleEvent(event);
			}
		});
	};
	this.wrapper.removeEventListener = function(type, method) {
		var set = this.listeners[type];
		if (set) {
			var index = set.indexOf(method);
			if (index >= 0) {
				set.splice(index, 1);
			}
		}
	};
	// Now we create the inner canvas element
	this.canvas = $tw.fakeDocument.createElement("canvas");
	this.wrapper.appendChild(this.canvas);
	// The canvas has a pointer to the div called "frame"
	this.canvas.frame = this.wrapper;
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

Network.prototype.getPosition = function(id) {
	var node = this.objects.nodes.get(id);
	return {x: node.x, y: node.y};
};

Network.prototype.moveTo = function() {
};

Network.prototype.destroy = function() {
	// Do nothing, except maybe flag that we're destroyed???
};

/*** Options that are not in vis-network, but exist for testing ***/

Network.prototype.testEvent = function(name, params) {
	this.invoke[name].call(this, params);
};

Network.prototype.getFrame = function() {
	return this.wrapper;
};

Network.prototype.redraw = function() {
	// Do nothing. Normally spied upon.
}

exports.Network = Network;
