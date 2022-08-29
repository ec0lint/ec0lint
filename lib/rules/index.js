/**
 * @fileoverview Collects the built-in rules into a map structure so that they can be imported all at once and without
 * using the file-system directly.
 * @author Peter (Somogyvari) Metz
 */

"use strict";

const { LazyLoadingRuleMap } = require("./utils/lazy-loading-rule-map");

/** @type {Map<string, import("../shared/types").Rule>} */
module.exports = new LazyLoadingRuleMap(Object.entries({
    "avoid-lodash": () => require("./avoid-lodash"),
    "lighter-http": () => require("./lighter-http"),
    "no-ajax": () => require("./no-ajax"),
    "no-ajax-events": () => require("./no-ajax-events"),
    "no-moment-js": () => require("./no-moment-js"),
    "no-date-fns": () => require("./no-date-fns"),
    "lighter-image-file": () => require("./lighter-image-file")
}));
