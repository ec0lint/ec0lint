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
    "padded-blocks": () => require("./padded-blocks"),
    "prefer-arrow-callback": () => require("./prefer-arrow-callback"),
    "prefer-const": () => require("./prefer-const"),
    "prefer-destructuring": () => require("./prefer-destructuring"),
    "prefer-exponentiation-operator": () => require("./prefer-exponentiation-operator"),
    "prefer-named-capture-group": () => require("./prefer-named-capture-group"),
    "prefer-numeric-literals": () => require("./prefer-numeric-literals"),
    "prefer-object-has-own": () => require("./prefer-object-has-own"),
    "prefer-object-spread": () => require("./prefer-object-spread"),
    "prefer-promise-reject-errors": () => require("./prefer-promise-reject-errors"),
    "prefer-reflect": () => require("./prefer-reflect"),
    "prefer-regex-literals": () => require("./prefer-regex-literals"),
    "prefer-rest-params": () => require("./prefer-rest-params"),
    "prefer-spread": () => require("./prefer-spread"),
    "prefer-template": () => require("./prefer-template"),
    "quote-props": () => require("./quote-props"),
    quotes: () => require("./quotes"),
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
