/**
 * @fileoverview Expose out ESLint and CLI to require.
 * @author Ian Christian Myers
 */

"use strict";

//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

const { ec0lint } = require("./ec0lint");
const { Linter } = require("./linter");
const { RuleTester } = require("./rule-tester");
const { SourceCode } = require("./source-code");

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

module.exports = {
    Linter,
    ec0lint,
    RuleTester,
    SourceCode
};
