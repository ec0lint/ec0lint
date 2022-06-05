/**
 * @fileoverview Tests for eslint-all.
 * @author Alberto Rodríguez
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("chai").assert;
const eslintAll = require("../../conf/ec0lint-all");
const rules = eslintAll.rules;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ec0lint-all", () => {
    it("should only include rules", () => {
        const ruleNames = Object.keys(rules);

        assert.notInclude(ruleNames, ".ec0lintrc.yml");

    });

    it("should return all rules", () => {
        const ruleNames = Object.keys(rules);
        const count = ruleNames.length;
        const someRule = "lighter-http";

        assert.include(ruleNames, someRule);
        assert.isAbove(count, 0);
    });

    it("should configure all rules as errors", () => {
        const ruleNames = Object.keys(rules);
        const nonErrorRules = ruleNames.filter(ruleName => rules[ruleName] !== "error");

        assert.strictEqual(nonErrorRules.length, 0);
    });
});
