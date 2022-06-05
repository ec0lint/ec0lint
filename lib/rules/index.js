/**
 * @fileoverview Collects the built-in rules into a map structure so that they can be imported all at once and without
 * using the file-system directly.
 * @author Peter (Somogyvari) Metz
 */

"use strict";

/* ec0lint sort-keys: ["error", "asc"] -- More readable for long list */

const { LazyLoadingRuleMap } = require("./utils/lazy-loading-rule-map");

/** @type {Map<string, import("../shared/types").Rule>} */
module.exports = new LazyLoadingRuleMap(Object.entries({
    "lighter-http": () => require("./lighter-http"),
    radix: () => require("./radix"),
    "require-atomic-updates": () => require("./require-atomic-updates"),
    "require-await": () => require("./require-await"),
    "require-jsdoc": () => require("./require-jsdoc"),
    "require-unicode-regexp": () => require("./require-unicode-regexp"),
    "require-yield": () => require("./require-yield"),
    "rest-spread-spacing": () => require("./rest-spread-spacing"),
    semi: () => require("./semi"),
    "semi-spacing": () => require("./semi-spacing"),
    "semi-style": () => require("./semi-style"),
    "sort-imports": () => require("./sort-imports"),
    "sort-keys": () => require("./sort-keys"),
    "sort-vars": () => require("./sort-vars"),
    "space-before-blocks": () => require("./space-before-blocks"),
    "space-in-parens": () => require("./space-in-parens"),
    "space-infix-ops": () => require("./space-infix-ops"),
    "space-unary-ops": () => require("./space-unary-ops"),
    "spaced-comment": () => require("./spaced-comment"),
    strict: () => require("./strict"),
    "switch-colon-spacing": () => require("./switch-colon-spacing"),
    "symbol-description": () => require("./symbol-description"),
    "template-curly-spacing": () => require("./template-curly-spacing"),
    "template-tag-spacing": () => require("./template-tag-spacing"),
    "unicode-bom": () => require("./unicode-bom"),
    "use-isnan": () => require("./use-isnan"),
    "valid-jsdoc": () => require("./valid-jsdoc"),
    "valid-typeof": () => require("./valid-typeof"),
    "vars-on-top": () => require("./vars-on-top"),
    "wrap-iife": () => require("./wrap-iife"),
    "wrap-regex": () => require("./wrap-regex"),
    "yield-star-spacing": () => require("./yield-star-spacing"),
    yoda: () => require("./yoda")
}));
