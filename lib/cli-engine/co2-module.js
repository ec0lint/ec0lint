/**
 * @fileoverview Computes space saving of each rule
 * @author Julia Ziębińska
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------
const commonLibsSize = {
    "avoid-lodash": 1.41,
    "no-moment-js": 4.23,
    "no-date-fns": 6.47,
    "axios": 0.44,
    "got": 0.24,
    "request": 0.2,
    "make-fetch-happen": 0.06,
    "superagent": 0.58,
    "needle": 0.26,
    "simple-get": 0.01
}
//------------------------------------------------------------------------------
// Private
//------------------------------------------------------------------------------

/**
 * computes size of each rule suggestion
 * @param {import("./cli-engine").LintMessage} message rule message to consider
 * @returns {number} size saved
 */
function co2Module(message) {
    if (message.ruleId === 'lighter-http') {
        const module = message.message.match(/axios|got|request|make-fetch-happen|superagent|needle|simple-get/)[0]
        return commonLibsSize[module]
    } else {
        return commonLibsSize[message.ruleId]
    }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = co2Module;
