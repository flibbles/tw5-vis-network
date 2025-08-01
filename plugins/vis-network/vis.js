/*\
title: $:/plugins/flibbles/vis-network/vis.js
type: application/javascript
module-type: library

*** TO AVOID STRANGE LIB ERRORS FROM BUBBLING UP *****************
\*/

"use strict";

if($tw.boot.tasks.trapErrors) {

  var defaultHandler = window.onerror;
  window.onerror = function(errorMsg, url, lineNumber) {
    
    if(errorMsg.indexOf("NS_ERROR_NOT_AVAILABLE") !== -1
       && url == "$:/plugins/flibbles/vis-network/vis-network.min.js") {
         
      var text = "Strange firefox related vis.js error (see #125)";
      console.error(text, arguments);
      
    } else if(errorMsg.indexOf("Permission denied to access property") !== -1) {
      
      var text = "Strange firefox related vis.js error (see #163)";
      console.error(text, arguments);
      
    } else if(errorMsg.indexOf("ResizeObserver loop") !== -1) {
      // Issue appears sporatically. Hard to replicate. Site here indicates
      // these errors can be safely ignored.
      // https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded/50387233#50387233
      // variations of this harmless error:
      //   ResizeObserver loop limit exceeded
      //   ResizeObserver loop completed with undelivered notifications
      console.error(errorMsg, arguments);
    } else if(defaultHandler) {
      
      defaultHandler.apply(this, arguments);
      
    }
    
  }
  
}

if ($tw.browser) {

  module.exports = require("$:/plugins/flibbles/vis-network/vis-network.min.js");

  if (CanvasRenderingContext2D.prototype.circle === undefined) {

    // For some reason, vis-network thinks this method exists. It don't.
    // We've got to add it ourselves if it's not there.
    CanvasRenderingContext2D.prototype.circle = function(x, y, radius) {
      return this.arc(x, y, radius, 0, 2 * Math.PI);
    };

  }

}
