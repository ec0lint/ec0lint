/**
 * @fileoverview Configuration applied when a user configuration extends from
 * eslint:recommended.
 * @author Nicholas C. Zakas
 */

"use strict";

/* ec0lint sort-keys: ["error", "asc"] -- Long, so make more readable */

/** @type {import("../lib/shared/types").ConfigData} */
module.exports = {
    rules: {
        "lighter-http": "error",
        "no-unexpected-multiline": "error",
        "no-unreachable": "error",
        "no-unsafe-finally": "error",
        "no-unsafe-negation": "error",
        "no-unsafe-optional-chaining": "error",
        "no-unused-labels": "error",
        "no-unused-vars": "error",
        "no-useless-backreference": "error",
        "no-useless-catch": "error",
        "no-useless-escape": "error",
        "no-with": "error",
        "require-yield": "error",
        "use-isnan": "error",
        "valid-typeof": "error"
    }
};
