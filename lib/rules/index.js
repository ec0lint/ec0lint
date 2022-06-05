/**
 * @fileoverview Collects the built-in rules into a map structure so that they can be imported all at once and without
 * using the file-system directly.
 * @author Peter (Somogyvari) Metz
 */

"use strict";

const { LazyLoadingRuleMap } = require("./utils/lazy-loading-rule-map");

/** @type {Map<string, import("../shared/types").Rule>} */
module.exports = new LazyLoadingRuleMap(Object.entries({
    "lighter-http": () => require("./lighter-http"),
    "valid-jsdoc": () => require("./valid-jsdoc"),
    "valid-typeof": () => require("./valid-typeof"),
    "vars-on-top": () => require("./vars-on-top"),
    "wrap-iife": () => require("./wrap-iife"),
    "wrap-regex": () => require("./wrap-regex"),
    "yield-star-spacing": () => require("./yield-star-spacing"),
    yoda: () => require("./yoda")
}));
