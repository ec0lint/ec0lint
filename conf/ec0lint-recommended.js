/**
 * @fileoverview Configuration applied when a user configuration extends from
 * eslint:recommended.
 * @author Nicholas C. Zakas
 */

"use strict";

/** @type {import("../lib/shared/types").ConfigData} */
module.exports = {
    rules: {
        "avoid-lodash": "error",
        "lighter-http": "error",
        "lighter-image-formats": "error",
        "lighter-video-formats": "error",
        "no-ajax-events": "error",
        "no-ajax": "error",
        "no-animate": "error",
        "no-attr":"error",
        "no-autoplay": "error",
        "no-bind": "error",
        "no-browser": "error",
        "no-box-model": "error",
        "no-date-fns": "error",
        "no-moment-js": "error",
    }
};
