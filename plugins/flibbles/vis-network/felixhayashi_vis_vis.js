/*\
title: $:/plugins/felixhayashi/vis/vis.js
type: application/javascript
module-type: library

This tiddler exists for backward compatibility to plugins which used ~$:/plugins/felixhayashi/vis. This plugin can be used in place of that one without any migration, although some buttons will have mismatched colors.
\*/

"use strict";

exports.default = require("$:/plugins/flibbles/vis-network/vis.js");

Object.defineProperty(exports, "__esModule", {
	value: true
});

// vis.js to vis-network changed the expected locale from en-EN to just en.
// This is the only thing preventing this library from being completely
// swappable with vis.js. But because this is here, plugins like TiddlyMap
// can recognize which locale to use by seeing this.
exports.default.locale = "en";

// This is a backup version of vis.keycharm, which was removed between
// Vis.js and vis-network
exports.default.keycharm = function(options) {
	return new LegacyKeyCharm(options);
};

function LegacyKeyCharm(options) {
	this.container = options.container;
};

// It's not important that it actually does anything. As far as I can tell,
// TiddlyMap doesn't actually use it meaningfully anymore.
LegacyKeyCharm.prototype.bind = function(key, method) {
};
