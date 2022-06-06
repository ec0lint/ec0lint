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
 * computes carbon footprint for provided weight in mB
 * @param {number} weight weight in mB
 * @returns {number} carbon footprint in g
 */
function computeCarbonFootprint(weight) {
    const ourKwH = weight * 0.81 / 1024
    return ourKwH * 442
}

/**
 * computes size of each rule suggestion
 * @param {import("./cli-engine").LintMessage} message rule message to consider
 * @returns {import("./cli-engine").CO2Data} size saved and reduced carbon footprint
 */
function co2Module(message) {
    if (message.ruleId === 'lighter-http') {
        const module = message.message.match(/axios|got|request|make-fetch-happen|superagent|needle|simple-get/)[0]
        const sizeSaved = commonLibsSize[module]
        const reducedFootprint = computeCarbonFootprint(sizeSaved)
        return {
            sizeSaved,
            reducedFootprint
        }
    } else {
        const sizeSaved = commonLibsSize[message.ruleId]
        const reducedFootprint = computeCarbonFootprint(sizeSaved)
        return {
            sizeSaved,
            reducedFootprint
        }
    }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = co2Module;
