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
        assert.strictEqual(rules["lighter-http"], "error");
    });
});
