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
        "no-extra-semi": "error"
    }
};
