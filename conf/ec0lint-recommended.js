/**
 * @fileoverview Configuration applied when a user configuration extends from
 * ec0lint:recommended.
 * @author Nicholas C. Zakas
 */

"use strict";

/* eslint sort-keys: ["error", "asc"] -- Long, so make more readable */

/** @type {import("../lib/shared/types").ConfigData} */
module.exports = {
    rules: {
        "lighter-http": "error"
    }
};
