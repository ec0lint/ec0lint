/**
 * @fileoverview Tests for ConfigCommentParser object.
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("chai").assert,
    ConfigCommentParser = require("../../../lib/linter/config-comment-parser");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ConfigCommentParser", () => {

    let commentParser;
    const location = {
        start: {
            line: 1,
            column: 0
        }
    };

    beforeEach(() => {
        commentParser = new ConfigCommentParser();
    });

    describe("parseJsonConfig", () => {

        it("should parse JSON config with one item", () => {
            const code = "lighter-http:0";
            const result = commentParser.parseJsonConfig(code, location);


            assert.deepStrictEqual(result, {
                success: true,
                config: {
                    "lighter-http": 0
                }
            });
        });

        it("should parse JSON config with two items", () => {
            const code = "lighter-http:0 semi: 2";
            const result = commentParser.parseJsonConfig(code, location);


            assert.deepStrictEqual(result, {
                success: true,
                config: {
                    "lighter-http": 0,
                    semi: 2
                }
            });
        });

        it("should parse JSON config with two comma-separated items", () => {
            const code = "lighter-http:0,semi: 2";
            const result = commentParser.parseJsonConfig(code, location);


            assert.deepStrictEqual(result, {
                success: true,
                config: {
                    "lighter-http": 0,
                    semi: 2
                }
            });
        });

        it("should parse JSON config with two items and a string severity", () => {
            const code = "lighter-http:off,semi: 2";
            const result = commentParser.parseJsonConfig(code, location);


            assert.deepStrictEqual(result, {
                success: true,
                config: {
                    "lighter-http": "off",
                    semi: 2
                }
            });
        });

        it("should parse JSON config with two items and options", () => {
            const code = "lighter-http:off, semi: [2, always]";
            const result = commentParser.parseJsonConfig(code, location);


            assert.deepStrictEqual(result, {
                success: true,
                config: {
                    "lighter-http": "off",
                    semi: [2, "always"]
                }
            });
        });

        it("should parse JSON config with two items and options from plugins", () => {
            const code = "plugin/lighter-http:off, plugin/semi: [2, always]";
            const result = commentParser.parseJsonConfig(code, location);

            assert.deepStrictEqual(result, {
                success: true,
                config: {
                    "plugin/lighter-http": "off",
                    "plugin/semi": [2, "always"]
                }
            });
        });


    });

    describe("parseStringConfig", () => {

        const comment = {};

        it("should parse String config with one item", () => {
            const code = "a: true";
            const result = commentParser.parseStringConfig(code, comment);

            assert.deepStrictEqual(result, {
                a: {
                    value: "true",
                    comment
                }
            });
        });

        it("should parse String config with one item and no value", () => {
            const code = "a";
            const result = commentParser.parseStringConfig(code, comment);

            assert.deepStrictEqual(result, {
                a: {
                    value: null,
                    comment
                }
            });
        });

        it("should parse String config with two items", () => {
            const code = "a: five b:three";
            const result = commentParser.parseStringConfig(code, comment);

            assert.deepStrictEqual(result, {
                a: {
                    value: "five",
                    comment
                },
                b: {
                    value: "three",
                    comment
                }
            });
        });

        it("should parse String config with two comma-separated items", () => {
            const code = "a: seventy, b:ELEVENTEEN";
            const result = commentParser.parseStringConfig(code, comment);

            assert.deepStrictEqual(result, {
                a: {
                    value: "seventy",
                    comment
                },
                b: {
                    value: "ELEVENTEEN",
                    comment
                }
            });
        });

        it("should parse String config with two comma-separated items and no values", () => {
            const code = "a , b";
            const result = commentParser.parseStringConfig(code, comment);

            assert.deepStrictEqual(result, {
                a: {
                    value: null,
                    comment
                },
                b: {
                    value: null,
                    comment
                }
            });
        });
    });

    describe("parseListConfig", () => {

        it("should parse list config with one item", () => {
            const code = "a";
            const result = commentParser.parseListConfig(code);

            assert.deepStrictEqual(result, {
                a: true
            });
        });

        it("should parse list config with two items", () => {
            const code = "a, b";
            const result = commentParser.parseListConfig(code);

            assert.deepStrictEqual(result, {
                a: true,
                b: true
            });
        });

        it("should parse list config with two items and exta whitespace", () => {
            const code = "  a , b  ";
            const result = commentParser.parseListConfig(code);

            assert.deepStrictEqual(result, {
                a: true,
                b: true
            });
        });
    });

});
