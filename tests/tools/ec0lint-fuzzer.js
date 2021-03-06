"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("chai").assert;
const eslint = require("../..");
const espree = require("espree");
const sinon = require("sinon");
const configRule = require("../../tools/config-rule");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ec0lint-fuzzer", function () {
    let fakeRule, fuzz;

    /*
     * These tests take awhile because isolating which rule caused an error requires running eslint up to hundreds of
     * times, one rule at a time.
     */
    this.timeout(15000);

    const linter = new eslint.Linter();
    const coreRules = linter.getRules();
    const fixableRuleNames = Array.from(coreRules)
        .filter(rulePair => rulePair[1].meta && rulePair[1].meta.fixable)
        .map(rulePair => rulePair[0]);
    const CRASH_BUG = new TypeError("error thrown from a rule");

    // A comment to disable all core fixable rules
    const disableFixableRulesComment = `// ec0lint-disable-line ${fixableRuleNames.join(",")}`;

    before(() => {
        const realCoreRuleConfigs = configRule.createCoreRuleConfigs();

        // Make sure the config generator generates a config for "test-fuzzer-rule"
        sinon.stub(configRule, "createCoreRuleConfigs").returns(Object.assign(realCoreRuleConfigs, { "test-fuzzer-rule": [2] }));

        // Create a closure around `fakeRule` so that tests can reassign it and have the changes take effect.
        linter.defineRule("test-fuzzer-rule", Object.assign(context => fakeRule(context), { meta: { fixable: "code" } }));

        fuzz = require("../../tools/ec0lint-fuzzer");
    });

    after(() => {
        configRule.createCoreRuleConfigs.restore();
    });

    describe("when running in crash-only mode", () => {
        describe("when a rule crashes on the given input", () => {
            it("should report the crash with a minimal config", () => {
                fakeRule = context => ({
                    Program() {
                        if (context.getSourceCode().text === "foo") {
                            throw CRASH_BUG;
                        }
                    }
                });

                const results = fuzz({ count: 1, codeGenerator: () => "foo", checkAutofixes: false, linter });

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].type, "crash");
                assert.strictEqual(results[0].text, "foo");
                assert.deepStrictEqual(results[0].config.rules, { "test-fuzzer-rule": 2 });
                assert.strictEqual(results[0].error, CRASH_BUG.stack);
            });
        });

        describe("when no rules crash", () => {
            it("should return an empty array", () => {
                fakeRule = () => ({});

                assert.deepStrictEqual(fuzz({ count: 1, codeGenerator: () => "foo", checkAutofixes: false, linter }), []);
            });
        });
    });

    describe("when running in crash-and-autofix mode", () => {
        const INVALID_SYNTAX = "this is not valid javascript syntax";
        let expectedSyntaxError;    
        try {
            espree.parse(INVALID_SYNTAX);
        } catch (err) {
            expectedSyntaxError = err;  // eslint-disable-line
        }

        describe("when a rule crashes on the given input", () => {
            it("should report the crash with a minimal config", () => {
                fakeRule = context => ({
                    Program() {
                        if (context.getSourceCode().text === "foo") {
                            throw CRASH_BUG;
                        }
                    }
                });

                const results = fuzz({ count: 1, codeGenerator: () => "foo", checkAutofixes: false, linter });

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].type, "crash");
                assert.strictEqual(results[0].text, "foo");
                assert.deepStrictEqual(results[0].config.rules, { "test-fuzzer-rule": 2 });
                assert.strictEqual(results[0].error, CRASH_BUG.stack);
            });
        });

        describe("when a rule's autofix produces valid syntax", () => {
            it("does not report any errors", () => {

                // Replaces programs that start with "foo" with "bar"
                fakeRule = context => ({
                    Program(node) {
                        if (context.getSourceCode().text === `foo ${disableFixableRulesComment}`) {
                            context.report({
                                node,
                                message: "no foos allowed",
                                fix: fixer => fixer.replaceText(node, `bar ${disableFixableRulesComment}`)
                            });
                        }
                    }
                });

                const results = fuzz({
                    count: 1,

                    /*
                     * To ensure that no other rules produce a different autofix and mess up the test, add a big disable
                     * comment for all core fixable rules.
                     */
                    codeGenerator: () => `foo ${disableFixableRulesComment}`,
                    checkAutofixes: true,
                    linter
                });

                assert.deepStrictEqual(results, []);
            });
        });
    });
});
