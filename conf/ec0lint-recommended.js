/**
 * @fileoverview Configuration applied when a user configuration extends from
 * eslint:recommended.
 * @author Nicholas C. Zakas
 */

"use strict";

/** @type {import("../lib/shared/types").ConfigData} */
module.exports = {
    rules: {
        "lighter-http": "error",
        "avoid-lodash": "error",
        "no-ajax-events": "error",
        "no-ajax": "error",
        "no-attr":"error",
        "no-animate": "error",
        "no-date-fns": "error",
        "no-moment-js": "error",
    }
};
