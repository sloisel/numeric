(function (root, factory) {
    if (typeof exports === 'object') {
        // Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.numeric = factory();
    }
}(this, function() {

'use strict';
var numeric = function numeric(){};

//if(typeof global !== "undefined") { global.numeric = numeric; }
