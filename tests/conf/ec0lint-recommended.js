/**
 * @fileoverview Tests for eslint:recommended.
 * @author Kevin Partington
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("chai").assert;
const eslintRecommended = require("../../conf/ec0lint-recommended");
const rules = eslintRecommended.rules;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ec0lint-recommended", () => {
    it("should configure recommended rules as error", () => {
        // assert.strictEqual(rules["no-extra-semi"], "error");
        // TODO after adding the first rule
    });

    it("should not configure non-recommended rules", () => {
        assert.notProperty(rules, "camelcase");
    });
});
