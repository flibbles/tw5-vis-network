# tw5-vis-network

This is a TiddlyWiki5 plugin which wraps the [vis-network library](https://github.com/visjs/vis-network). It's intended to be a modern replacement for the [TW5-Vis.js](https://github.com/felixhayashi/TW5-Vis.js/) when used with [TW5-TiddlyMap](https://github.com/felixhayashi/TW5-TiddlyMap).

It includes a legacy tiddler which allows it to swap out TW5-Vis, even with older versions of TiddlyMap, although some features may be disabled.

To update the version of vis-network used, fetch the latest .min.js file from [here](https://unpkg.com/vis-network/standalone/umd/vis-network.min.js).

---

# Notes on Copyright

### TiddlyWiki

Created by Jeremy Ruston, (jeremy [at] jermolene [dot] com)

Copyright © Jeremy Ruston 2004-2007 Copyright © UnaMesa Association 2007-2022

Published under the following [licenses](https://github.com/Jermolene/TiddlyWiki5/tree/master/licenses):

1. BSD 3-clause "New" or "Revised" License (including any right to adopt any future version of a license if permitted)
2. Creative Commons Attribution 3.0 (including any right to adopt any future version of a license if permitted)

### The **vis-network** library

Copyright (c) 2010-2018 [Almende B.V.](https://github.com/vis/vis-network) and Contributors Copyright (c) 2018-2021 Vis.js contributors

Published under the following licenses:

1. Apache License Version 2.0, http://www.apache.org/licenses/LICENSE-2.0
2. MIT License (MIT)

# How to run tests

Make sure you have `tiddlywiki` available on your PATH. Then from the project root directory, type:

`tiddlywiki --build test`
