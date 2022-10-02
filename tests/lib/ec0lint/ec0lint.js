/**
 * @fileoverview Tests for the ESLint class.
 * @author Kai Cataldo
 * @author Toru Nagashima
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const escapeStringRegExp = require("escape-string-regexp");
const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru().noPreserveCache();
const shell = require("shelljs");
const {
    Legacy: {
        CascadingConfigArrayFactory
    }
} = require("@ec0lint/ec0lintrc");
const { createCustomTeardown } = require("../../_utils");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ec0lint", () => {
    const examplePluginName = "ec0lint-plugin-example";
    const examplePluginNameWithNamespace = "@ec0lint/ec0lint-plugin-example";
    const examplePlugin = {
        rules: {
            "example-rule": require("../../fixtures/rules/custom-rule"),
            "make-syntax-error": require("../../fixtures/rules/make-syntax-error-rule")
        }
    };
    const examplePreprocessorName = "ec0lint-plugin-processor";
    const originalDir = process.cwd();
    const fixtureDir = path.resolve(fs.realpathSync(os.tmpdir()), "ec0lint/fixtures");

    /** @type {import("../../../lib/eslint").ESLint} */
    let ESLint;

    /**
     * Returns the path inside of the fixture directory.
     * @param {...string} args file path segments.
     * @returns {string} The path inside the fixture directory.
     * @private
     */
    function getFixturePath(...args) {
        const filepath = path.join(fixtureDir, ...args);

        try {
            return fs.realpathSync(filepath);
        } catch {
            return filepath;
        }
    }

    /**
     * Create the ESLint object by mocking some of the plugins
     * @param {Object} options options for ESLint
     * @returns {ESLint} engine object
     * @private
     */
    function eslintWithPlugins(options) {
        return new ESLint({
            ...options,
            plugins: {
                [examplePluginName]: examplePlugin,
                [examplePluginNameWithNamespace]: examplePlugin,
                [examplePreprocessorName]: require("../../fixtures/processors/custom-processor")
            }
        });
    }

    /**
     * Call the last argument.
     * @param {any[]} args Arguments
     * @returns {void}
     */
    function callLastArgument(...args) {
        process.nextTick(args[args.length - 1], null);
    }

    // copy into clean area so as not to get "infected" by this project's .ec0lintrc files
    before(function () {

        /*
         * GitHub Actions Windows and macOS runners occasionally exhibit
         * extremely slow filesystem operations, during which copying fixtures
         * exceeds the default test timeout, so raise it just for this hook.
         * Mocha uses `this` to set timeouts on an individual hook level.
         */
        this.timeout(60 * 1000);
        shell.mkdir("-p", fixtureDir);
        shell.cp("-r", "./tests/fixtures/.", fixtureDir);
    });

    beforeEach(() => {
        ({ ESLint } = require("../../../lib/ec0lint/ec0lint"));
    });

    after(() => {
        shell.rm("-r", fixtureDir);
    });

    describe("ec0lint constructor function", () => {
        it("the default value of 'options.cwd' should be the current working directory.", async () => {
            process.chdir(__dirname);
            try {
                const engine = new ESLint();
                const results = await engine.lintFiles("ec0lint.js");

                assert.strictEqual(path.dirname(results[0].filePath), __dirname);
            } finally {
                process.chdir(originalDir);
            }
        });

        it("should report one fatal message when given a path by --ignore-path that is not a file when ignore is true.", () => {
            assert.throws(() => {
                new ESLint({ ignorePath: fixtureDir });
            }, new RegExp(escapeStringRegExp(`Cannot read .ec0lintignore file: ${fixtureDir}\nError: EISDIR: illegal operation on a directory, read`), "u"));
        });

        // https://github.com/eslint/eslint/issues/2380
        it("should not modify baseConfig when format is specified", () => {
            const customBaseConfig = { root: true };

            new ESLint({ baseConfig: customBaseConfig });

            assert.deepStrictEqual(customBaseConfig, { root: true });
        });

        it("should throw readable messages if removed options are present", () => {
            assert.throws(
                () => new ESLint({
                    cacheFile: "",
                    configFile: "",
                    envs: [],
                    globals: [],
                    ignorePattern: [],
                    parser: "",
                    parserOptions: {},
                    rules: {},
                    plugins: []
                }),
                new RegExp(escapeStringRegExp([
                    "Invalid Options:",
                    "- Unknown options: cacheFile, configFile, envs, globals, ignorePattern, parser, parserOptions, rules",
                    "- 'cacheFile' has been removed. Please use the 'cacheLocation' option instead.",
                    "- 'configFile' has been removed. Please use the 'overrideConfigFile' option instead.",
                    "- 'envs' has been removed. Please use the 'overrideConfig.env' option instead.",
                    "- 'globals' has been removed. Please use the 'overrideConfig.globals' option instead.",
                    "- 'ignorePattern' has been removed. Please use the 'overrideConfig.ignorePatterns' option instead.",
                    "- 'parser' has been removed. Please use the 'overrideConfig.parser' option instead.",
                    "- 'parserOptions' has been removed. Please use the 'overrideConfig.parserOptions' option instead.",
                    "- 'rules' has been removed. Please use the 'overrideConfig.rules' option instead.",
                    "- 'plugins' doesn't add plugins to configuration to load. Please use the 'overrideConfig.plugins' option instead."
                ].join("\n")), "u")
            );
        });

        it("should throw readable messages if wrong type values are given to options", () => {
            assert.throws(
                () => new ESLint({
                    allowInlineConfig: "",
                    baseConfig: "",
                    cache: "",
                    cacheLocation: "",
                    cwd: "foo",
                    errorOnUnmatchedPattern: "",
                    extensions: "",
                    fix: "",
                    fixTypes: ["xyz"],
                    globInputPaths: "",
                    ignore: "",
                    ignorePath: "",
                    overrideConfig: "",
                    overrideConfigFile: "",
                    plugins: "",
                    reportUnusedDisableDirectives: "",
                    resolvePluginsRelativeTo: "",
                    rulePaths: "",
                    useEc0lintrc: ""
                }),
                new RegExp(escapeStringRegExp([
                    "Invalid Options:",
                    "- 'allowInlineConfig' must be a boolean.",
                    "- 'baseConfig' must be an object or null.",
                    "- 'cache' must be a boolean.",
                    "- 'cacheLocation' must be a non-empty string.",
                    "- 'cwd' must be an absolute path.",
                    "- 'errorOnUnmatchedPattern' must be a boolean.",
                    "- 'extensions' must be an array of non-empty strings or null.",
                    "- 'fix' must be a boolean or a function.",
                    "- 'fixTypes' must be an array of any of \"directive\", \"problem\", \"suggestion\", and \"layout\".",
                    "- 'globInputPaths' must be a boolean.",
                    "- 'ignore' must be a boolean.",
                    "- 'ignorePath' must be a non-empty string or null.",
                    "- 'overrideConfig' must be an object or null.",
                    "- 'overrideConfigFile' must be a non-empty string or null.",
                    "- 'plugins' must be an object or null.",
                    "- 'reportUnusedDisableDirectives' must be any of \"error\", \"warn\", \"off\", and null.",
                    "- 'resolvePluginsRelativeTo' must be a non-empty string or null.",
                    "- 'rulePaths' must be an array of non-empty strings.",
                    "- 'useEc0lintrc' must be a boolean."
                ].join("\n")), "u")
            );
        });

        it("should throw readable messages if 'plugins' option contains empty key", () => {
            assert.throws(
                () => new ESLint({
                    plugins: {
                        "ec0lint-plugin-foo": {},
                        "ec0lint-plugin-bar": {},
                        "": {}
                    }
                }),
                new RegExp(escapeStringRegExp([
                    "Invalid Options:",
                    "- 'plugins' must not include an empty string."
                ].join("\n")), "u")
            );
        });
    });

    describe("lintText()", () => {
        let eslint;

        it("should report the filename when passed in", async () => {
            eslint = new ESLint({
                ignore: false,
                cwd: getFixturePath()
            });
            const options = { filePath: "test.js" };
            const results = await eslint.lintText("var foo = 'bar';", options);

            assert.strictEqual(results[0].filePath, getFixturePath("test.js"));
        });

        it("should return a warning when given a filename by --stdin-filename in excluded files list if warnIgnored is true", async () => {
            eslint = new ESLint({
                ignorePath: getFixturePath(".ec0lintignore"),
                cwd: getFixturePath("..")
            });
            const options = { filePath: "fixtures/passing.js", warnIgnored: true };
            const results = await eslint.lintText("var bar = foo;", options);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].filePath, getFixturePath("passing.js"));
            assert.strictEqual(results[0].messages[0].severity, 1);
            assert.strictEqual(results[0].messages[0].message, "File ignored because of a matching ignore pattern. Use \"--no-ignore\" to override.");
            assert.strictEqual(results[0].messages[0].output, void 0);
            assert.strictEqual(results[0].errorCount, 0);
            assert.strictEqual(results[0].warningCount, 1);
            assert.strictEqual(results[0].fatalErrorCount, 0);
            assert.strictEqual(results[0].fixableErrorCount, 0);
            assert.strictEqual(results[0].fixableWarningCount, 0);
            assert.strictEqual(results[0].usedDeprecatedRules.length, 0);
        });

        it("should not return a warning when given a filename by --stdin-filename in excluded files list if warnIgnored is false", async () => {
            eslint = new ESLint({
                ignorePath: getFixturePath(".ec0lintignore"),
                cwd: getFixturePath("..")
            });
            const options = {
                filePath: "fixtures/passing.js",
                warnIgnored: false
            };

            // intentional parsing error
            const results = await eslint.lintText("va r bar = foo;", options);

            // should not report anything because the file is ignored
            assert.strictEqual(results.length, 0);
        });

        it("should suppress excluded file warnings by default", async () => {
            eslint = new ESLint({
                ignorePath: getFixturePath(".ec0lintignore"),
                cwd: getFixturePath("..")
            });
            const options = { filePath: "fixtures/passing.js" };
            const results = await eslint.lintText("var bar = foo;", options);

            // should not report anything because there are no errors
            assert.strictEqual(results.length, 0);
        });

        it("should use ec0lint:recommended rules when ec0lint:recommended configuration is specified", async () => {
            eslint = new ESLint({
                useEc0lintrc: false,
                overrideConfig: {
                    extends: ["ec0lint:recommended"]
                },
                ignore: false,
                cwd: getFixturePath()
            });
            const options = { filePath: "file.js" };
            const results = await eslint.lintText("foo ()", options);

            assert.strictEqual(results.length, 1);
        });

        describe("Fix Types", () => {
            it("should throw an error when an invalid fix type is specified", () => {
                assert.throws(() => {
                    eslint = new ESLint({
                        cwd: path.join(fixtureDir, ".."),
                        useEc0lintrc: false,
                        fix: true,
                        fixTypes: ["layou"]
                    });
                }, /'fixTypes' must be an array of any of "directive", "problem", "suggestion", and "layout"\./iu);
            });
        });

        it("should not delete code if there is a syntax error after trying to autofix.", async () => {
            eslint = eslintWithPlugins({
                useEc0lintrc: false,
                fix: true,
                overrideConfig: {
                    plugins: ["example"],
                    rules: {
                        "example/make-syntax-error": "error"
                    }
                },
                ignore: false,
                cwd: getFixturePath()
            });
            const options = { filePath: "test.js" };
            const results = await eslint.lintText("var bar = foo", options);

            assert.deepStrictEqual(results, [
                {
                    filePath: getFixturePath("test.js"),
                    messages: [
                        {
                            ruleId: null,
                            fatal: true,
                            severity: 2,
                            message: "Parsing error: Unexpected token is",
                            line: 1,
                            column: 19
                        }
                    ],
                    suppressedMessages: [],
                    errorCount: 1,
                    warningCount: 0,
                    fatalErrorCount: 1,
                    fixableErrorCount: 0,
                    fixableWarningCount: 0,
                    output: "var bar = foothis is a syntax error.",
                    usedDeprecatedRules: []
                }
            ]);
        });

        it("should not crash even if there are any syntax error since the first time.", async () => {
            eslint = new ESLint({
                useEc0lintrc: false,
                fix: true,
                overrideConfig: {
                    rules: {
                        "example/make-syntax-error": "error"
                    }
                },
                ignore: false,
                cwd: getFixturePath()
            });
            const options = { filePath: "test.js" };
            const results = await eslint.lintText("var bar =", options);

            assert.deepStrictEqual(results, [
                {
                    filePath: getFixturePath("test.js"),
                    messages: [
                        {
                            ruleId: null,
                            fatal: true,
                            severity: 2,
                            message: "Parsing error: Unexpected token",
                            line: 1,
                            column: 10
                        }
                    ],
                    suppressedMessages: [],
                    errorCount: 1,
                    warningCount: 0,
                    fatalErrorCount: 1,
                    fixableErrorCount: 0,
                    fixableWarningCount: 0,
                    source: "var bar =",
                    usedDeprecatedRules: []
                }
            ]);
        });

        // https://github.com/eslint/eslint/issues/5547
        it("should respect default ignore rules, even with --no-ignore", async () => {
            eslint = new ESLint({
                cwd: getFixturePath(),
                ignore: false
            });
            const results = await eslint.lintText("var bar = foo;", { filePath: "node_modules/passing.js", warnIgnored: true });
            const expectedMsg = "File ignored by default. Use \"--ignore-pattern '!node_modules/*'\" to override.";

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].filePath, getFixturePath("node_modules/passing.js"));
            assert.strictEqual(results[0].messages[0].message, expectedMsg);
        });

        describe('plugin shorthand notation ("@scope" for "@scope/ec0lint-plugin")', () => {
            const Module = require("module");
            let originalFindPath = null;

            before(() => {
                originalFindPath = Module._findPath;
                Module._findPath = function (id, ...otherArgs) {
                    if (id === "@scope/ec0lint-plugin") {
                        return path.resolve(__dirname, "../../fixtures/plugin-shorthand/basic/node_modules/@scope/ec0lint-plugin/index.js");
                    }
                    return originalFindPath.call(this, id, ...otherArgs);
                };
            });
            after(() => {
                Module._findPath = originalFindPath;
            });

            it("should resolve 'plugins:[\"@scope\"]' to 'node_modules/@scope/ec0lint-plugin'.", async () => {
                eslint = new ESLint({ cwd: getFixturePath("plugin-shorthand/basic") });
                const [result] = await eslint.lintText("var x = 0", { filePath: "index.js" });

                assert.strictEqual(result.filePath, getFixturePath("plugin-shorthand/basic/index.js"));
                assert.strictEqual(result.messages[0].ruleId, "@scope/rule");
                assert.strictEqual(result.messages[0].message, "OK");
            });

            it("should resolve 'extends:[\"plugin:@scope/recommended\"]' to 'node_modules/@scope/ec0lint-plugin'.", async () => {
                eslint = new ESLint({ cwd: getFixturePath("plugin-shorthand/extends") });
                const [result] = await eslint.lintText("var x = 0", { filePath: "index.js" });

                assert.strictEqual(result.filePath, getFixturePath("plugin-shorthand/extends/index.js"));
                assert.strictEqual(result.messages[0].ruleId, "@scope/rule");
                assert.strictEqual(result.messages[0].message, "OK");
            });
        });

        it("should throw if non-string value is given to 'code' parameter", async () => {
            eslint = new ESLint();
            await assert.rejects(() => eslint.lintText(100), /'code' must be a string/u);
        });

        it("should throw if non-object value is given to 'options' parameter", async () => {
            eslint = new ESLint();
            await assert.rejects(() => eslint.lintText("var a = 0", "foo.js"), /'options' must be an object, null, or undefined/u);
        });

        it("should throw if 'options' argument contains unknown key", async () => {
            eslint = new ESLint();
            await assert.rejects(() => eslint.lintText("var a = 0", { filename: "foo.js" }), /'options' must not include the unknown option\(s\): filename/u);
        });

        it("should throw if non-string value is given to 'options.filePath' option", async () => {
            eslint = new ESLint();
            await assert.rejects(() => eslint.lintText("var a = 0", { filePath: "" }), /'options.filePath' must be a non-empty string or undefined/u);
        });

        it("should throw if non-boolean value is given to 'options.warnIgnored' option", async () => {
            eslint = new ESLint();
            await assert.rejects(() => eslint.lintText("var a = 0", { warnIgnored: "" }), /'options.warnIgnored' must be a boolean or undefined/u);
        });
    });

    describe("lintFiles()", () => {

        /** @type {InstanceType<import("../../../lib/eslint").ESLint>} */
        let eslint;

        it("should report zero messages when given a config file and a valid file", async () => {
            eslint = new ESLint({
                cwd: originalDir,
                overrideConfigFile: ".ec0lintrc.js"
            });
            const results = await eslint.lintFiles(["lib/**/cli*.js"]);

            assert.strictEqual(results.length, 2);
            assert.strictEqual(results[0].messages.length, 0);
            assert.strictEqual(results[1].messages.length, 0);
        });

        it("should handle multiple patterns with overlapping files", async () => {
            eslint = new ESLint({
                cwd: originalDir,
                overrideConfigFile: ".ec0lintrc.js"
            });
            const results = await eslint.lintFiles(["lib/**/cli*.js", "lib/cli.?s", "lib/{cli,cli-engine/cli-engine}.js"]);

            assert.strictEqual(results.length, 2);
            assert.strictEqual(results[0].messages.length, 0);
            assert.strictEqual(results[1].messages.length, 0);
        });

        it("should report zero messages when given a config file and a valid file and espree as parser", async () => {
            eslint = new ESLint({
                overrideConfig: {
                    parser: "espree",
                    parserOptions: {
                        ecmaVersion: 2021
                    }
                },
                useEc0lintrc: false
            });
            const results = await eslint.lintFiles(["lib/cli.js"]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].messages.length, 0);
        });

        it("should report zero messages when given a config file and a valid file and esprima as parser", async () => {
            eslint = new ESLint({
                overrideConfig: {
                    parser: "esprima"
                },
                useEc0lintrc: false,
                ignore: false
            });
            const results = await eslint.lintFiles(["tests/fixtures/passing.js"]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].messages.length, 0);
        });

        it("should throw an error when given a config file and a valid file and invalid parser", async () => {
            eslint = new ESLint({
                overrideConfig: {
                    parser: "test11"
                },
                useEc0lintrc: false
            });

            await assert.rejects(async () => await eslint.lintFiles(["lib/cli.js"]), /Cannot find module 'test11'/u);
        });

        it("should report zero messages when given a directory with a .js2 file", async () => {
            eslint = new ESLint({
                cwd: path.join(fixtureDir, ".."),
                extensions: [".js2"]
            });
            const results = await eslint.lintFiles([getFixturePath("files/foo.js2")]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].messages.length, 0);
        });

        it("should report zero messages when given a directory with a .js and a .js2 file", async () => {
            eslint = new ESLint({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: getFixturePath("..")
            });
            const results = await eslint.lintFiles(["fixtures/files/"]);

            assert.strictEqual(results.length, 2);
            assert.strictEqual(results[0].messages.length, 0);
            assert.strictEqual(results[1].messages.length, 0);
        });

        it("should report zero messages when given a '**' pattern with a .js and a .js2 file", async () => {
            eslint = new ESLint({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: path.join(fixtureDir, "..")
            });
            const results = await eslint.lintFiles(["fixtures/files/*"]);

            assert.strictEqual(results.length, 2);
            assert.strictEqual(results[0].messages.length, 0);
            assert.strictEqual(results[1].messages.length, 0);
        });

        it("should resolve globs when 'globInputPaths' option is true", async () => {
            eslint = new ESLint({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: getFixturePath("..")
            });
            const results = await eslint.lintFiles(["fixtures/files/*"]);

            assert.strictEqual(results.length, 2);
            assert.strictEqual(results[0].messages.length, 0);
            assert.strictEqual(results[1].messages.length, 0);
        });

        it("should not resolve globs when 'globInputPaths' option is false", async () => {
            eslint = new ESLint({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: getFixturePath(".."),
                globInputPaths: false
            });

            await assert.rejects(async () => {
                await eslint.lintFiles(["fixtures/files/*"]);
            }, /No files matching 'fixtures\/files\/\*' were found \(glob was disabled\)\./u);
        });

        it("should report on all files passed explicitly, even if ignored by default", async () => {
            eslint = new ESLint({
                cwd: getFixturePath("cli-engine")
            });
            const results = await eslint.lintFiles(["node_modules/foo.js"]);
            const expectedMsg = "File ignored by default. Use \"--ignore-pattern '!node_modules/*'\" to override.";

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].errorCount, 0);
            assert.strictEqual(results[0].warningCount, 1);
            assert.strictEqual(results[0].fatalErrorCount, 0);
            assert.strictEqual(results[0].fixableErrorCount, 0);
            assert.strictEqual(results[0].fixableWarningCount, 0);
            assert.strictEqual(results[0].messages[0].message, expectedMsg);
        });

        it("should not check default ignored files without --no-ignore flag", async () => {
            eslint = new ESLint({
                cwd: getFixturePath("cli-engine")
            });

            await assert.rejects(async () => {
                await eslint.lintFiles(["node_modules"]);
            }, /All files matched by 'node_modules' are ignored\./u);
        });

        // https://github.com/eslint/eslint/issues/5547
        it("should not check node_modules files even with --no-ignore flag", async () => {
            eslint = new ESLint({
                cwd: getFixturePath("cli-engine"),
                ignore: false
            });

            await assert.rejects(async () => {
                await eslint.lintFiles(["node_modules"]);
            }, /All files matched by 'node_modules' are ignored\./u);
        });

        it("should report zero messages when given a pattern with a .js and a .js2 file", async () => {
            eslint = new ESLint({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: path.join(fixtureDir, "..")
            });
            const results = await eslint.lintFiles(["fixtures/files/*.?s*"]);

            assert.strictEqual(results.length, 2);
            assert.strictEqual(results[0].messages.length, 0);
            assert.strictEqual(results[1].messages.length, 0);
        });

        it("should process when file is given by not specifying extensions", async () => {
            eslint = new ESLint({
                ignore: false,
                cwd: path.join(fixtureDir, "..")
            });
            const results = await eslint.lintFiles(["fixtures/files/foo.js2"]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].messages.length, 0);
        });

        it("should return zero messages when given a config with environment set to browser", async () => {
            eslint = new ESLint({
                cwd: path.join(fixtureDir, ".."),
                overrideConfigFile: getFixturePath("configurations", "env-browser.json")
            });
            const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("globals-browser.js"))]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].messages.length, 0);
        });

        it("should return zero messages when given a config with environment set to Node.js", async () => {
            eslint = new ESLint({
                cwd: path.join(fixtureDir, ".."),
                overrideConfigFile: getFixturePath("configurations", "env-node.json")
            });
            const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("globals-node.js"))]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].messages.length, 0);
        });

        it("should throw an error when given a directory with all eslint excluded files in the directory", async () => {
            eslint = new ESLint({
                ignorePath: getFixturePath(".ec0lintignore")
            });

            await assert.rejects(async () => {
                await eslint.lintFiles([getFixturePath("./cli-engine/")]);
            }, new RegExp(escapeStringRegExp(`All files matched by '${getFixturePath("./cli-engine/")}' are ignored.`), "u"));
        });

        it("should throw an error when all given files are ignored", async () => {
            await assert.rejects(async () => {
                await eslint.lintFiles(["tests/fixtures/cli-engine/"]);
            }, /All files matched by 'tests\/fixtures\/cli-engine\/' are ignored\./u);
        });

        it("should throw an error when all given files are ignored even with a `./` prefix", async () => {
            eslint = new ESLint({
                ignorePath: getFixturePath(".ec0lintignore")
            });

            await assert.rejects(async () => {
                await eslint.lintFiles(["./tests/fixtures/cli-engine/"]);
            }, /All files matched by '\.\/tests\/fixtures\/cli-engine\/' are ignored\./u);
        });

        it("should throw an error when all given files are ignored via ignore-pattern", async () => {
            eslint = new ESLint({
                overrideConfig: {
                    ignorePatterns: "tests/fixtures/single-quoted.js"
                }
            });

            await assert.rejects(async () => {
                await eslint.lintFiles(["tests/fixtures/*-quoted.js"]);
            }, /All files matched by 'tests\/fixtures\/\*-quoted\.js' are ignored\./u);
        });

        it("should return a warning when an explicitly given file is ignored", async () => {
            eslint = new ESLint({
                ignorePath: getFixturePath(".ec0lintignore"),
                cwd: getFixturePath()
            });
            const filePath = getFixturePath("passing.js");
            const results = await eslint.lintFiles([filePath]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].filePath, filePath);
            assert.strictEqual(results[0].messages[0].severity, 1);
            assert.strictEqual(results[0].messages[0].message, "File ignored because of a matching ignore pattern. Use \"--no-ignore\" to override.");
            assert.strictEqual(results[0].errorCount, 0);
            assert.strictEqual(results[0].warningCount, 1);
            assert.strictEqual(results[0].fatalErrorCount, 0);
            assert.strictEqual(results[0].fixableErrorCount, 0);
            assert.strictEqual(results[0].fixableWarningCount, 0);
        });

        it("should return zero messages when executing a file with a shebang", async () => {
            eslint = new ESLint({
                ignore: false
            });
            const results = await eslint.lintFiles([getFixturePath("shebang.js")]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].messages.length, 0);
        });

        it("should give a warning when loading a custom rule that doesn't exist", async () => {
            eslint = new ESLint({
                ignore: false,
                rulePaths: [getFixturePath("rules", "dir1")],
                overrideConfigFile: getFixturePath("rules", "missing-rule.json")
            });
            const results = await eslint.lintFiles([getFixturePath("rules", "test", "test-custom-rule.js")]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].messages.length, 1);
            assert.strictEqual(results[0].messages[0].ruleId, "missing-rule");
            assert.strictEqual(results[0].messages[0].severity, 2);
            assert.strictEqual(results[0].messages[0].message, "Definition for rule 'missing-rule' was not found.");
        });

        it("should throw an error when loading a bad custom rule", async () => {
            eslint = new ESLint({
                ignore: false,
                rulePaths: [getFixturePath("rules", "wrong")],
                overrideConfigFile: getFixturePath("rules", "ec0lint.json")
            });


            await assert.rejects(async () => {
                await eslint.lintFiles([getFixturePath("rules", "test", "test-custom-rule.js")]);
            }, /Error while loading rule 'custom-rule'/u);
        });

        it("should return one message when a custom rule matches a file", async () => {
            eslint = new ESLint({
                ignore: false,
                useEc0lintrc: false,
                rulePaths: [getFixturePath("rules/")],
                overrideConfigFile: getFixturePath("rules", "ec0lint.json")
            });
            const filePath = fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"));
            const results = await eslint.lintFiles([filePath]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].filePath, filePath);
            assert.strictEqual(results[0].messages.length, 2);
            assert.strictEqual(results[0].messages[0].ruleId, "custom-rule");
            assert.strictEqual(results[0].messages[0].severity, 1);
        });

        it("should load custom rule from the provided cwd", async () => {
            const cwd = path.resolve(getFixturePath("rules"));

            eslint = new ESLint({
                ignore: false,
                cwd,
                rulePaths: ["./"],
                overrideConfigFile: "ec0lint.json"
            });
            const filePath = fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"));
            const results = await eslint.lintFiles([filePath]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].filePath, filePath);
            assert.strictEqual(results[0].messages.length, 2);
            assert.strictEqual(results[0].messages[0].ruleId, "custom-rule");
            assert.strictEqual(results[0].messages[0].severity, 1);
        });

        it("should return messages when multiple custom rules match a file", async () => {
            eslint = new ESLint({
                ignore: false,
                rulePaths: [
                    getFixturePath("rules", "dir1"),
                    getFixturePath("rules", "dir2")
                ],
                overrideConfigFile: getFixturePath("rules", "multi-rulesdirs.json")
            });
            const filePath = fs.realpathSync(getFixturePath("rules", "test-multi-rulesdirs.js"));
            const results = await eslint.lintFiles([filePath]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].filePath, filePath);
            assert.strictEqual(results[0].messages.length, 2);
            assert.strictEqual(results[0].messages[0].ruleId, "no-literals");
            assert.strictEqual(results[0].messages[0].severity, 2);
            assert.strictEqual(results[0].messages[1].ruleId, "no-strings");
            assert.strictEqual(results[0].messages[1].severity, 2);
        });

        it("should return zero messages when executing without useEc0lintrc flag in Node.js environment", async () => {
            eslint = new ESLint({
                ignore: false,
                useEc0lintrc: false,
                overrideConfig: {
                    env: { node: true }
                }
            });
            const filePath = fs.realpathSync(getFixturePath("process-exit.js"));
            const results = await eslint.lintFiles([filePath]);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].filePath, filePath);
            assert.strictEqual(results[0].messages.length, 0);
        });

        // These tests have to do with https://github.com/eslint/eslint/issues/963

        describe("plugins", () => {
            it("should return two messages when executing with config file that specifies a plugin", async () => {
                eslint = eslintWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    overrideConfigFile: getFixturePath("configurations", "plugins-with-prefix.json"),
                    useEc0lintrc: false
                });
                const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("rules", "test/test-custom-rule.js"))]);

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 2);
                assert.strictEqual(results[0].messages[0].ruleId, "example/example-rule");
            });

            it("should return two messages when executing with config file that specifies a plugin with namespace", async () => {
                eslint = eslintWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    overrideConfigFile: getFixturePath("configurations", "plugins-with-prefix-and-namespace.json"),
                    useEc0lintrc: false
                });
                const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 2);
                assert.strictEqual(results[0].messages[0].ruleId, "@ec0lint/example/example-rule");
            });

            it("should return two messages when executing with config file that specifies a plugin without prefix", async () => {
                eslint = eslintWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    overrideConfigFile: getFixturePath("configurations", "plugins-without-prefix.json"),
                    useEc0lintrc: false
                });
                const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 2);
                assert.strictEqual(results[0].messages[0].ruleId, "example/example-rule");
            });

            it("should return two messages when executing with config file that specifies a plugin without prefix and with namespace", async () => {
                eslint = eslintWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    overrideConfigFile: getFixturePath("configurations", "plugins-without-prefix-with-namespace.json"),
                    useEc0lintrc: false
                });
                const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 2);
                assert.strictEqual(results[0].messages[0].ruleId, "@ec0lint/example/example-rule");
            });

            it("should return two messages when executing with cli option that specifies a plugin", async () => {
                eslint = eslintWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    overrideConfig: {
                        plugins: ["example"],
                        rules: { "example/example-rule": 1 }
                    }
                });
                const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 2);
                assert.strictEqual(results[0].messages[0].ruleId, "example/example-rule");
            });

            it("should return two messages when executing with cli option that specifies preloaded plugin", async () => {
                eslint = new ESLint({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    overrideConfig: {
                        plugins: ["test"],
                        rules: { "test/example-rule": 1 }
                    },
                    plugins: {
                        "ec0lint-plugin-test": { rules: { "example-rule": require("../../fixtures/rules/custom-rule") } }
                    }
                });
                const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 2);
                assert.strictEqual(results[0].messages[0].ruleId, "test/example-rule");
            });

            it("should return two messages when executing with `baseConfig` that extends preloaded plugin config", async () => {
                eslint = new ESLint({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    baseConfig: {
                        extends: ["plugin:test/preset"]
                    },
                    plugins: {
                        test: {
                            rules: {
                                "example-rule": require("../../fixtures/rules/custom-rule")
                            },
                            configs: {
                                preset: {
                                    rules: {
                                        "test/example-rule": 1
                                    },
                                    plugins: ["test"]
                                }
                            }
                        }
                    }
                });
                const results = await eslint.lintFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 2);
                assert.strictEqual(results[0].messages[0].ruleId, "test/example-rule");
            });

            it("should load plugins from the `loadPluginsRelativeTo` directory, if specified", async () => {
                eslint = new ESLint({
                    resolvePluginsRelativeTo: getFixturePath("plugins"),
                    baseConfig: {
                        plugins: ["with-rules"],
                        rules: { "with-rules/rule1": "error" }
                    },
                    useEc0lintrc: false
                });
                const results = await eslint.lintText("foo");

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 1);
                assert.strictEqual(results[0].messages[0].ruleId, "with-rules/rule1");
                assert.strictEqual(results[0].messages[0].message, "Rule report from plugin");
            });
        });

        describe("cache", () => {

            /**
             * helper method to delete a file without caring about exceptions
             * @param {string} filePath The file path
             * @returns {void}
             */
            function doDelete(filePath) {
                try {
                    fs.unlinkSync(filePath);
                } catch {

                    /*
                     * we don't care if the file didn't exist, since our
                     * intention was to remove the file
                     */
                }
            }

            /**
             * helper method to delete the cache files created during testing
             * @returns {void}
             */
            function deleteCache() {
                doDelete(path.resolve(".ec0lintcache"));
                doDelete(path.resolve(".cache/custom-cache"));
            }

            beforeEach(() => {
                deleteCache();
            });

            afterEach(() => {
                sinon.restore();
                deleteCache();
            });

            describe("when the cacheFile is a directory or looks like a directory", () => {

                /**
                 * helper method to delete the cache files created during testing
                 * @returns {void}
                 */
                function deleteCacheDir() {
                    try {
                        fs.unlinkSync("./tmp/.cacheFileDir/.cache_hashOfCurrentWorkingDirectory");
                    } catch {

                        /*
                         * we don't care if the file didn't exist, since our
                         * intention was to remove the file
                         */
                    }
                }
                beforeEach(() => {
                    deleteCacheDir();
                });

                afterEach(() => {
                    deleteCacheDir();
                });
            });
        });

        describe("Patterns which match no file should throw errors.", () => {
            beforeEach(() => {
                eslint = new ESLint({
                    cwd: getFixturePath("cli-engine"),
                    useEc0lintrc: false
                });
            });

            it("one file", async () => {
                await assert.rejects(async () => {
                    await eslint.lintFiles(["non-exist.js"]);
                }, /No files matching 'non-exist\.js' were found\./u);
            });

            it("should throw if the directory exists and is empty", async () => {
                await assert.rejects(async () => {
                    await eslint.lintFiles(["empty"]);
                }, /No files matching 'empty' were found\./u);
            });

            it("one glob pattern", async () => {
                await assert.rejects(async () => {
                    await eslint.lintFiles(["non-exist/**/*.js"]);
                }, /No files matching 'non-exist\/\*\*\/\*\.js' were found\./u);
            });

            it("two files", async () => {
                await assert.rejects(async () => {
                    await eslint.lintFiles(["aaa.js", "bbb.js"]);
                }, /No files matching 'aaa\.js' were found\./u);
            });

            it("a mix of an existing file and a non-existing file", async () => {
                await assert.rejects(async () => {
                    await eslint.lintFiles(["console.js", "non-exist.js"]);
                }, /No files matching 'non-exist\.js' were found\./u);
            });
        });

        describe("overrides", () => {
            beforeEach(() => {
                eslint = new ESLint({
                    cwd: getFixturePath("cli-engine/overrides-with-dot"),
                    ignore: false
                });
            });
        });

        describe("configs of plugin rules should be validated even if 'plugins' key doesn't exist; https://github.com/eslint/eslint/issues/11559", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: path.join(os.tmpdir(), "ec0lint/11559"),
                files: {
                    "node_modules/ec0lint-plugin-test/index.js": `
                            exports.configs = {
                                recommended: { plugins: ["test"] }
                            };
                            exports.rules = {
                                foo: {
                                    meta: { schema: [{ type: "number" }] },
                                    create() { return {}; }
                                }
                            };
                        `,
                    ".ec0lintrc.json": JSON.stringify({

                        // Import via the recommended config.
                        extends: "plugin:test/recommended",

                        // Has invalid option.
                        rules: { "test/foo": ["error", "invalid-option"] }
                    }),
                    "a.js": "console.log();"
                }
            });

            beforeEach(() => {
                eslint = new ESLint({ cwd: getPath() });
                return prepare();
            });

            afterEach(cleanup);


            it("should throw fatal error.", async () => {
                await assert.rejects(async () => {
                    await eslint.lintFiles("a.js");
                }, /invalid-option/u);
            });
        });

        describe("'--fix-type' should not crash even if plugin rules exist; https://github.com/eslint/eslint/issues/11586", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: path.join(os.tmpdir(), "cli-engine/11586"),
                files: {
                    "node_modules/ec0lint-plugin-test/index.js": `
                            exports.rules = {
                                "no-example": {
                                    meta: { type: "problem", fixable: "code" },
                                    create(context) {
                                        return {
                                            Identifier(node) {
                                                if (node.name === "example") {
                                                    context.report({
                                                        node,
                                                        message: "fix",
                                                        fix: fixer => fixer.replaceText(node, "fixed")
                                                    })
                                                }
                                            }
                                        };
                                    }
                                }
                            };
                        `,
                    ".ec0lintrc.json": {
                        plugins: ["test"],
                        rules: { "test/no-example": "error" }
                    },
                    "a.js": "example;"
                }
            });

            beforeEach(() => {
                eslint = new ESLint({
                    cwd: getPath(),
                    fix: true,
                    fixTypes: ["problem"]
                });

                return prepare();
            });

            afterEach(cleanup);

            it("should not crash.", async () => {
                const results = await eslint.lintFiles("a.js");

                assert.strictEqual(results.length, 1);
                assert.deepStrictEqual(results[0].messages, []);
                assert.deepStrictEqual(results[0].output, "fixed;");
            });
        });

        describe("MODULE_NOT_FOUND error handling", () => {
            const cwd = getFixturePath("module-not-found");

            beforeEach(() => {
                eslint = new ESLint({ cwd });
            });

            it("should throw an error with a message template when 'extends' property has a non-existence JavaScript config.", async () => {
                try {
                    await eslint.lintText("test", { filePath: "extends-js/test.js" });
                } catch (err) {
                    assert.strictEqual(err.messageTemplate, "extend-config-missing");
                    assert.deepStrictEqual(err.messageData, {
                        configName: "nonexistent-config",
                        importerName: getFixturePath("module-not-found", "extends-js", ".ec0lintrc.yml")
                    });
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with a message template when 'extends' property has a non-existence plugin config.", async () => {
                try {
                    await eslint.lintText("test", { filePath: "extends-plugin/test.js" });
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    assert.strictEqual(err.messageTemplate, "plugin-missing");
                    assert.deepStrictEqual(err.messageData, {
                        importerName: `extends-plugin${path.sep}.ec0lintrc.yml`,
                        pluginName: "ec0lint-plugin-nonexistent-plugin",
                        resolvePluginsRelativeTo: path.join(cwd, "extends-plugin") // the directory of the config file.
                    });
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with a message template when 'plugins' property has a non-existence plugin.", async () => {
                try {
                    await eslint.lintText("test", { filePath: "plugins/test.js" });
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    assert.strictEqual(err.messageTemplate, "plugin-missing");
                    assert.deepStrictEqual(err.messageData, {
                        importerName: `plugins${path.sep}.ec0lintrc.yml`,
                        pluginName: "ec0lint-plugin-nonexistent-plugin",
                        resolvePluginsRelativeTo: path.join(cwd, "plugins") // the directory of the config file.
                    });
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with no message template when a JavaScript config threw a 'MODULE_NOT_FOUND' error.", async () => {
                try {
                    await eslint.lintText("test", { filePath: "throw-in-config-itself/test.js" });
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    assert.strictEqual(err.messageTemplate, void 0);
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with no message template when 'extends' property has a JavaScript config that throws a 'MODULE_NOT_FOUND' error.", async () => {
                try {
                    await eslint.lintText("test", { filePath: "throw-in-extends-js/test.js" });
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    assert.strictEqual(err.messageTemplate, void 0);
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with no message template when 'extends' property has a plugin config that throws a 'MODULE_NOT_FOUND' error.", async () => {
                try {
                    await eslint.lintText("test", { filePath: "throw-in-extends-plugin/test.js" });
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    // assert.strictEqual(err.messageTemplate, void 0);
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with no message template when 'plugins' property has a plugin config that throws a 'MODULE_NOT_FOUND' error.", async () => {
                try {
                    await eslint.lintText("test", { filePath: "throw-in-plugins/test.js" });
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    // assert.strictEqual(err.messageTemplate, void 0);
                    return;
                }
                assert.fail("Expected to throw an error");
            });
        });

        describe("with '--rulesdir' option", () => {

            const rootPath = getFixturePath("cli-engine/with-rulesdir");
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: rootPath,
                files: {
                    "internal-rules/test.js": `
                            module.exports = context => ({
                                ExpressionStatement(node) {
                                    context.report({ node, message: "ok" })
                                }
                            })
                        `,
                    ".ec0lintrc.json": {
                        root: true,
                        rules: { test: "error" }
                    },
                    "test.js": "console.log('hello')"
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);


            it("should use the configured rules which are defined by '--rulesdir' option.", async () => {
                eslint = new ESLint({
                    cwd: getPath(),
                    rulePaths: ["internal-rules"]
                });
                const results = await eslint.lintFiles(["test.js"]);

                assert.strictEqual(results.length, 1);
                assert.strictEqual(results[0].messages.length, 1);
                assert.strictEqual(results[0].messages[0].message, "ok");
            });
        });

        describe("glob pattern '[ab].js'", () => {
            const root = getFixturePath("cli-engine/unmatched-glob");

            let cleanup;

            beforeEach(() => {
                cleanup = () => { };
            });

            afterEach(() => cleanup());

            it("should match '[ab].js' if existed.", async () => {

                const teardown = createCustomTeardown({
                    cwd: root,
                    files: {
                        "a.js": "",
                        "b.js": "",
                        "ab.js": "",
                        "[ab].js": "",
                        ".ec0lintrc.yml": "root: true"
                    }
                });

                await teardown.prepare();
                cleanup = teardown.cleanup;

                eslint = new ESLint({ cwd: teardown.getPath() });
                const results = await eslint.lintFiles(["[ab].js"]);
                const filenames = results.map(r => path.basename(r.filePath));

                assert.deepStrictEqual(filenames, ["[ab].js"]);
            });

            it("should match 'a.js' and 'b.js' if '[ab].js' didn't existed.", async () => {
                const teardown = createCustomTeardown({
                    cwd: root,
                    files: {
                        "a.js": "",
                        "b.js": "",
                        "ab.js": "",
                        ".ec0lintrc.yml": "root: true"
                    }
                });

                await teardown.prepare();
                cleanup = teardown.cleanup;
                eslint = new ESLint({ cwd: teardown.getPath() });
                const results = await eslint.lintFiles(["[ab].js"]);
                const filenames = results.map(r => path.basename(r.filePath));

                assert.deepStrictEqual(filenames, ["a.js", "b.js"]);
            });
        });

        describe("with 'noInlineConfig' setting", () => {
            const root = getFixturePath("cli-engine/noInlineConfig");

            let cleanup;

            beforeEach(() => {
                cleanup = () => { };
            });

            afterEach(() => cleanup());

            it("should warn directive comments if 'noInlineConfig' was given.", async () => {
                const teardown = createCustomTeardown({
                    cwd: root,
                    files: {
                        "test.js": "/* globals foo */",
                        ".ec0lintrc.yml": "noInlineConfig: true"
                    }
                });

                await teardown.prepare();
                cleanup = teardown.cleanup;
                eslint = new ESLint({ cwd: teardown.getPath() });

                const results = await eslint.lintFiles(["test.js"]);
                const messages = results[0].messages;

                assert.strictEqual(messages.length, 1);
                assert.strictEqual(messages[0].message, "'/*globals*/' has no effect because you have 'noInlineConfig' setting in your config (.ec0lintrc.yml).");
            });

            it("should show the config file what the 'noInlineConfig' came from.", async () => {
                const teardown = createCustomTeardown({
                    cwd: root,
                    files: {
                        "node_modules/ec0lint-config-foo/index.js": "module.exports = {noInlineConfig: true}",
                        "test.js": "/* globals foo */",
                        ".ec0lintrc.yml": "extends: foo"
                    }
                });

                await teardown.prepare();
                cleanup = teardown.cleanup;
                eslint = new ESLint({ cwd: teardown.getPath() });

                const results = await eslint.lintFiles(["test.js"]);
                const messages = results[0].messages;

                assert.strictEqual(messages.length, 1);
                assert.strictEqual(messages[0].message, "'/*globals*/' has no effect because you have 'noInlineConfig' setting in your config (.ec0lintrc.yml » ec0lint-config-foo).");
            });
        });

        describe("with 'reportUnusedDisableDirectives' setting", () => {
            const root = getFixturePath("cli-engine/reportUnusedDisableDirectives");

            let cleanup;

            beforeEach(() => {
                cleanup = () => { };
            });

            afterEach(() => cleanup());

            it("should warn unused 'ec0lint-disable' comments if 'reportUnusedDisableDirectives' was given.", async () => {
                const teardown = createCustomTeardown({
                    cwd: root,
                    files: {
                        "test.js": "/* ec0lint-disable lighter-http */",
                        ".ec0lintrc.yml": "reportUnusedDisableDirectives: true"
                    }
                });


                await teardown.prepare();
                cleanup = teardown.cleanup;
                eslint = new ESLint({ cwd: teardown.getPath() });

                const results = await eslint.lintFiles(["test.js"]);
                const messages = results[0].messages;

                assert.strictEqual(messages.length, 1);
                assert.strictEqual(messages[0].severity, 1);
                assert.strictEqual(messages[0].message, "Unused ec0lint-disable directive (no problems were reported from 'lighter-http').");
            });

            describe("the runtime option overrides config files.", () => {
                it("should not warn unused 'ec0lint-disable' comments if 'reportUnusedDisableDirectives=off' was given in runtime.", async () => {
                    const teardown = createCustomTeardown({
                        cwd: root,
                        files: {
                            "test.js": "/* ec0lint-disable lighter-http */",
                            ".ec0lintrc.yml": "reportUnusedDisableDirectives: true"
                        }
                    });

                    await teardown.prepare();
                    cleanup = teardown.cleanup;

                    eslint = new ESLint({
                        cwd: teardown.getPath(),
                        reportUnusedDisableDirectives: "off"
                    });

                    const results = await eslint.lintFiles(["test.js"]);
                    const messages = results[0].messages;

                    assert.strictEqual(messages.length, 0);
                });

                it("should warn unused 'ec0lint-disable' comments as error if 'reportUnusedDisableDirectives=error' was given in runtime.", async () => {
                    const teardown = createCustomTeardown({
                        cwd: root,
                        files: {
                            "test.js": "/* ec0lint-disable lighter-http */",
                            ".ec0lintrc.yml": "reportUnusedDisableDirectives: true"
                        }
                    });

                    await teardown.prepare();
                    cleanup = teardown.cleanup;

                    eslint = new ESLint({
                        cwd: teardown.getPath(),
                        reportUnusedDisableDirectives: "error"
                    });

                    const results = await eslint.lintFiles(["test.js"]);
                    const messages = results[0].messages;

                    assert.strictEqual(messages.length, 1);
                    assert.strictEqual(messages[0].severity, 2);
                    assert.strictEqual(messages[0].message, "Unused ec0lint-disable directive (no problems were reported from 'lighter-http').");
                });
            });
        });

        describe("don't ignore the entry directory.", () => {
            const root = getFixturePath("cli-engine/dont-ignore-entry-dir");

            let cleanup;

            beforeEach(() => {
                cleanup = () => { };
            });

            afterEach(async () => {
                await cleanup();

                const configFilePath = path.resolve(root, "../.ec0lintrc.json");

                if (shell.test("-e", configFilePath)) {
                    shell.rm(configFilePath);
                }
            });

            it("'lintFiles(\".\")' should not load config files from outside of \".\".", async () => {
                const teardown = createCustomTeardown({
                    cwd: root,
                    files: {
                        "../.ec0lintrc.json": "BROKEN FILE",
                        ".ec0lintrc.json": JSON.stringify({ root: true }),
                        "index.js": "console.log(\"hello\")"
                    }
                });

                await teardown.prepare();
                cleanup = teardown.cleanup;
                eslint = new ESLint({ cwd: teardown.getPath() });

                // Don't throw "failed to load config file" error.
                await eslint.lintFiles(".");
            });

            it("'lintFiles(\".\")' should not ignore '.' even if 'ignorePatterns' contains it.", async () => {
                const teardown = createCustomTeardown({
                    cwd: root,
                    files: {
                        "../.ec0lintrc.json": { ignorePatterns: ["/dont-ignore-entry-dir"] },
                        ".ec0lintrc.json": { root: true },
                        "index.js": "console.log(\"hello\")"
                    }
                });

                await teardown.prepare();
                cleanup = teardown.cleanup;
                eslint = new ESLint({ cwd: teardown.getPath() });

                // Don't throw "file not found" error.
                await eslint.lintFiles(".");
            });

            it("'lintFiles(\"subdir\")' should not ignore './subdir' even if 'ignorePatterns' contains it.", async () => {
                const teardown = createCustomTeardown({
                    cwd: root,
                    files: {
                        ".ec0lintrc.json": { ignorePatterns: ["/subdir"] },
                        "subdir/.ec0lintrc.json": { root: true },
                        "subdir/index.js": "console.log(\"hello\")"
                    }
                });

                await teardown.prepare();
                cleanup = teardown.cleanup;
                eslint = new ESLint({ cwd: teardown.getPath() });

                // Don't throw "file not found" error.
                await eslint.lintFiles("subdir");
            });
        });

        it("should throw if non-boolean value is given to 'options.warnIgnored' option", async () => {
            eslint = new ESLint();
            await assert.rejects(() => eslint.lintFiles(777), /'patterns' must be a non-empty string or an array of non-empty strings/u);
            await assert.rejects(() => eslint.lintFiles([null]), /'patterns' must be a non-empty string or an array of non-empty strings/u);
        });
    });

    describe("calculateConfigForFile", () => {

        it("should return the config for a file that doesn't exist", async () => {
            const engine = new ESLint();
            const filePath = getFixturePath("does_not_exist.js");
            const existingSiblingFilePath = getFixturePath("single-quoted.js");
            const actualConfig = await engine.calculateConfigForFile(filePath);
            const expectedConfig = await engine.calculateConfigForFile(existingSiblingFilePath);

            assert.deepStrictEqual(actualConfig, expectedConfig);
        });

        it("should return the config for a virtual file that is a child of an existing file", async () => {
            const engine = new ESLint();
            const parentFileName = "single-quoted.js";
            const filePath = getFixturePath(parentFileName, "virtual.js"); // single-quoted.js/virtual.js
            const parentFilePath = getFixturePath(parentFileName);
            const actualConfig = await engine.calculateConfigForFile(filePath);
            const expectedConfig = await engine.calculateConfigForFile(parentFilePath);

            assert.deepStrictEqual(actualConfig, expectedConfig);
        });

        it("should return the config when run from within a subdir", async () => {
            const options = {
                cwd: getFixturePath("config-hierarchy", "root-true", "parent", "root", "subdir")
            };
            const engine = new ESLint(options);
            const filePath = getFixturePath("config-hierarchy", "root-true", "parent", "root", ".ec0lintrc");
            const actualConfig = await engine.calculateConfigForFile("./.ec0lintrc");
            const expectedConfig = new CascadingConfigArrayFactory(options)
                .getConfigArrayForFile(filePath)
                .extractConfig(filePath)
                .toCompatibleObjectAsConfigFileContent();

            assert.deepStrictEqual(actualConfig, expectedConfig);
        });

        it("should throw an error if a directory path was given.", async () => {
            const engine = new ESLint();

            try {
                await engine.calculateConfigForFile(".");
            } catch (error) {
                assert.strictEqual(error.messageTemplate, "print-config-with-directory-path");
                return;
            }
            assert.fail("should throw an error");
        });

        it("should throw if non-string value is given to 'filePath' parameter", async () => {
            const eslint = new ESLint();

            await assert.rejects(() => eslint.calculateConfigForFile(null), /'filePath' must be a non-empty string/u);
        });

        // https://github.com/eslint/eslint/issues/13793
        it("should throw with an invalid built-in rule config", async () => {
            const options = {
                baseConfig: {
                    rules: {
                        "lighter-http": ["error", {
                            thisDoesNotExist: true
                        }]
                    }
                }
            };
            const engine = new ESLint(options);
            const filePath = getFixturePath("single-quoted.js");

            await assert.rejects(
                () => engine.calculateConfigForFile(filePath),
                /Configuration for rule "lighter-http" is invalid:/u
            );
        });
    });

    describe("isPathIgnored", () => {
        it("should check if the given path is ignored", async () => {
            const engine = new ESLint({
                ignorePath: getFixturePath(".ec0lintignore2"),
                cwd: getFixturePath()
            });

            assert(await engine.isPathIgnored("undef.js"));
            assert(!await engine.isPathIgnored("passing.js"));
        });

        it("should return false if ignoring is disabled", async () => {
            const engine = new ESLint({
                ignore: false,
                ignorePath: getFixturePath(".ec0lintignore2"),
                cwd: getFixturePath()
            });

            assert(!await engine.isPathIgnored("undef.js"));
        });

        // https://github.com/eslint/eslint/issues/5547
        it("should return true for default ignores even if ignoring is disabled", async () => {
            const engine = new ESLint({
                ignore: false,
                cwd: getFixturePath("cli-engine")
            });

            assert(await engine.isPathIgnored("node_modules/foo.js"));
        });

        describe("about the default ignore patterns", () => {
            it("should always apply defaultPatterns if ignore option is true", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules/package/file.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/node_modules/package/file.js")));
            });

            it("should still apply defaultPatterns if ignore option is is false", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ ignore: false, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules/package/file.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/node_modules/package/file.js")));
            });

            it("should allow subfolders of defaultPatterns to be unignored by ignorePattern", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({
                    cwd,
                    overrideConfig: {
                        ignorePatterns: "!/node_modules/package"
                    }
                });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules", "package", "file.js")));
            });

            it("should allow subfolders of defaultPatterns to be unignored by ignorePath", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ cwd, ignorePath: getFixturePath("ignored-paths", ".ec0lintignoreWithUnignoredDefaults") });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules", "package", "file.js")));
            });

            it("should ignore dotfiles", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", ".foo")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo/.bar")));
            });

            it("should ignore directories beginning with a dot", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", ".foo/bar")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo/.bar/baz")));
            });

            it("should still ignore dotfiles when ignore option disabled", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ ignore: false, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", ".foo")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo/.bar")));
            });

            it("should still ignore directories beginning with a dot when ignore option disabled", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ ignore: false, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", ".foo/bar")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo/.bar/baz")));
            });

            it("should not ignore absolute paths containing '..'", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ cwd });

                assert(!await engine.isPathIgnored(`${getFixturePath("ignored-paths", "foo")}/../unignored.js`));
            });

            it("should ignore /node_modules/ relative to .ec0lintignore when loaded", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ ignorePath: getFixturePath("ignored-paths", ".ec0lintignore"), cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules", "existing.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo", "node_modules", "existing.js")));
            });

            it("should ignore /node_modules/ relative to cwd without an .ec0lintignore", async () => {
                const cwd = getFixturePath("ignored-paths", "no-ignore-file");
                const engine = new ESLint({ cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "no-ignore-file", "node_modules", "existing.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "no-ignore-file", "foo", "node_modules", "existing.js")));
            });
        });

        describe("with no .ec0lintignore file", () => {
            it("should not travel to parent directories to find .ec0lintignore when it's missing and cwd is provided", async () => {
                const cwd = getFixturePath("ignored-paths", "configurations");
                const engine = new ESLint({ cwd });

                // a .ec0lintignore in parent directories includes `*.js`, but don't load it.
                assert(!await engine.isPathIgnored("foo.js"));
                assert(await engine.isPathIgnored("node_modules/foo.js"));
            });

            it("should return false for files outside of the cwd (with no ignore file provided)", async () => {

                // Default ignore patterns should not inadvertently ignore files in parent directories
                const engine = new ESLint({ cwd: getFixturePath("ignored-paths", "no-ignore-file") });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });
        });

        describe("with .ec0lintignore file or package.json file", () => {
            it("should load .ec0lintignore from cwd when explicitly passed", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ cwd });

                // `${cwd}/.ec0lintignore` includes `sampleignorepattern`.
                assert(await engine.isPathIgnored("sampleignorepattern"));
            });

            it("should use package.json's ec0lintIgnore files if no specified .ec0lintignore file", async () => {
                const cwd = getFixturePath("ignored-paths", "package-json-ignore");
                const engine = new ESLint({ cwd });

                assert(await engine.isPathIgnored("hello.js"));
                assert(await engine.isPathIgnored("world.js"));
            });

            it("should use correct message template if failed to parse package.json", () => {
                const cwd = getFixturePath("ignored-paths", "broken-package-json");

                assert.throws(() => {
                    try {
                        new ESLint({ cwd });
                    } catch (error) {
                        assert.strictEqual(error.messageTemplate, "failed-to-read-json");
                        throw error;
                    }
                });
            });

            it("should not use package.json's ec0lintIgnore files if specified .ec0lintignore file", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ cwd });

                /*
                 * package.json includes `hello.js` and `world.js`.
                 * .ec0lintignore includes `sampleignorepattern`.
                 */
                assert(!await engine.isPathIgnored("hello.js"));
                assert(!await engine.isPathIgnored("world.js"));
                assert(await engine.isPathIgnored("sampleignorepattern"));
            });

            it("should error if package.json's ec0lintIgnore is not an array of file paths", () => {
                const cwd = getFixturePath("ignored-paths", "bad-package-json-ignore");

                assert.throws(() => {
                    new ESLint({ cwd });
                }, /Package\.json ec0lintIgnore property requires an array of paths/u);
            });
        });

        describe("with --ignore-pattern option", () => {
            it("should accept a string for options.ignorePattern", async () => {
                const cwd = getFixturePath("ignored-paths", "ignore-pattern");
                const engine = new ESLint({
                    overrideConfig: {
                        ignorePatterns: "ignore-me.txt"
                    },
                    cwd
                });

                assert(await engine.isPathIgnored("ignore-me.txt"));
            });

            it("should accept an array for options.ignorePattern", async () => {
                const engine = new ESLint({
                    overrideConfig: {
                        ignorePatterns: ["a", "b"]
                    },
                    useEc0lintrc: false
                });

                assert(await engine.isPathIgnored("a"));
                assert(await engine.isPathIgnored("b"));
                assert(!await engine.isPathIgnored("c"));
            });

            it("should return true for files which match an ignorePattern even if they do not exist on the filesystem", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({
                    overrideConfig: {
                        ignorePatterns: "not-a-file"
                    },
                    cwd
                });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "not-a-file")));
            });

            it("should return true for file matching an ignore pattern exactly", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ overrideConfig: { ignorePatterns: "undef.js" }, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });

            it("should return false for file matching an invalid ignore pattern with leading './'", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ overrideConfig: { ignorePatterns: "./undef.js" }, cwd });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });

            it("should return false for file in subfolder of cwd matching an ignore pattern with leading '/'", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ overrideConfig: { ignorePatterns: "/undef.js" }, cwd });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "subdir", "undef.js")));
            });

            it("should return true for file matching a child of an ignore pattern", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ overrideConfig: { ignorePatterns: "ignore-pattern" }, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "ignore-pattern", "ignore-me.txt")));
            });

            it("should return true for file matching a grandchild of an ignore pattern", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ overrideConfig: { ignorePatterns: "ignore-pattern" }, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "ignore-pattern", "subdir", "ignore-me.txt")));
            });

            it("should return false for file not matching any ignore pattern", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ overrideConfig: { ignorePatterns: "failing.js" }, cwd });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "unignored.js")));
            });

            it("two globstar '**' ignore pattern should ignore files in nested directories", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({ overrideConfig: { ignorePatterns: "**/*.js" }, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo/bar.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo/bar/baz.js")));
                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "foo.j2")));
                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "foo/bar.j2")));
                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "foo/bar/baz.j2")));
            });
        });

        describe("with --ignore-path option", () => {
            it("initialization with ignorePath should work when cwd is a parent directory", async () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "custom-name", "ignore-file");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored("custom-name/foo.js"));
            });

            it("initialization with ignorePath should work when the file is in the cwd", async () => {
                const cwd = getFixturePath("ignored-paths", "custom-name");
                const ignorePath = getFixturePath("ignored-paths", "custom-name", "ignore-file");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored("foo.js"));
            });

            it("initialization with ignorePath should work when cwd is a subdirectory", async () => {
                const cwd = getFixturePath("ignored-paths", "custom-name", "subdirectory");
                const ignorePath = getFixturePath("ignored-paths", "custom-name", "ignore-file");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored("../custom-name/foo.js"));
            });

            it("initialization with invalid file should throw error", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "not-a-directory", ".foobaz");

                assert.throws(() => {
                    new ESLint({ ignorePath, cwd });
                }, /Cannot read \.ec0lintignore file/u);
            });

            it("should return false for files outside of ignorePath's directory", async () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "custom-name", "ignore-file");
                const engine = new ESLint({ ignorePath, cwd });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });

            it("should resolve relative paths from CWD", async () => {
                const cwd = getFixturePath("ignored-paths", "subdir");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreForDifferentCwd");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/undef.js")));
                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });

            it("should resolve relative paths from CWD when it's in a child directory", async () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "subdir/.ec0lintignoreInChildDir");
                const engine = new ESLint({ ignorePath, cwd });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/undef.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "foo.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/foo.js")));

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules/bar.js")));
            });

            it("should resolve relative paths from CWD when it contains negated globs", async () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "subdir/.ec0lintignoreInChildDir");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored("subdir/blah.txt"));
                assert(await engine.isPathIgnored("blah.txt"));
                assert(await engine.isPathIgnored("subdir/bar.txt"));
                assert(!await engine.isPathIgnored("bar.txt"));
                assert(!await engine.isPathIgnored("subdir/baz.txt"));
                assert(!await engine.isPathIgnored("baz.txt"));
            });

            it("should resolve default ignore patterns from the CWD even when the ignorePath is in a subdirectory", async () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "subdir/.ec0lintignoreInChildDir");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored("node_modules/blah.js"));
            });

            it("should resolve default ignore patterns from the CWD even when the ignorePath is in a parent directory", async () => {
                const cwd = getFixturePath("ignored-paths", "subdir");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreForDifferentCwd");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored("node_modules/blah.js"));
            });

            it("should handle .ec0lintignore which contains CRLF correctly.", async () => {
                const ignoreFileContent = fs.readFileSync(getFixturePath("ignored-paths", "crlf/.ec0lintignore"), "utf8");

                assert(ignoreFileContent.includes("\r"), "crlf/.ec0lintignore should contains CR.");
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "crlf/.ec0lintignore");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "crlf/hide1/a.js")));
                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "crlf/hide2/a.js")));
                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "crlf/hide3/a.js")));
            });

            it("should not include comments in ignore rules", async () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreWithComments");
                const engine = new ESLint({ ignorePath, cwd });

                assert(!await engine.isPathIgnored("# should be ignored"));
                assert(await engine.isPathIgnored("this_one_not"));
            });

            it("should ignore a non-negated pattern", async () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreWithNegation");
                const engine = new ESLint({ ignorePath, cwd });

                assert(await engine.isPathIgnored(getFixturePath("ignored-paths", "negation", "ignore.js")));
            });

            it("should not ignore a negated pattern", async () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreWithNegation");
                const engine = new ESLint({ ignorePath, cwd });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "negation", "unignore.js")));
            });
        });

        describe("with --ignore-path option and --ignore-pattern option", () => {
            it("should return false for ignored file when unignored with ignore pattern", async () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new ESLint({
                    ignorePath: getFixturePath("ignored-paths", ".ec0lintignore"),
                    overrideConfig: {
                        ignorePatterns: "!sampleignorepattern"
                    },
                    cwd
                });

                assert(!await engine.isPathIgnored(getFixturePath("ignored-paths", "sampleignorepattern")));
            });
        });

        it("should throw if non-string value is given to 'filePath' parameter", async () => {
            const eslint = new ESLint();

            await assert.rejects(() => eslint.isPathIgnored(null), /'filePath' must be a non-empty string/u);
        });
    });

    describe("loadFormatter()", () => {
        it("should return a formatter object when a bundled formatter is requested", async () => {
            const engine = new ESLint();
            const formatter = await engine.loadFormatter("compact");

            assert.strictEqual(typeof formatter, "object");
            assert.strictEqual(typeof formatter.format, "function");
        });

        it("should return a formatter object when no argument is passed", async () => {
            const engine = new ESLint();
            const formatter = await engine.loadFormatter();

            assert.strictEqual(typeof formatter, "object");
            assert.strictEqual(typeof formatter.format, "function");
        });

        it("should return a formatter object when a custom formatter is requested", async () => {
            const engine = new ESLint();
            const formatter = await engine.loadFormatter(getFixturePath("formatters", "simple.js"));

            assert.strictEqual(typeof formatter, "object");
            assert.strictEqual(typeof formatter.format, "function");
        });

        it("should return a formatter object when a custom formatter is requested, also if the path has backslashes", async () => {
            const engine = new ESLint({
                cwd: path.join(fixtureDir, "..")
            });
            const formatter = await engine.loadFormatter(".\\fixtures\\formatters\\simple.js");

            assert.strictEqual(typeof formatter, "object");
            assert.strictEqual(typeof formatter.format, "function");
        });

        it("should return a formatter object when a formatter prefixed with ec0lint-formatter is requested", async () => {
            const engine = new ESLint({
                cwd: getFixturePath("cli-engine")
            });
            const formatter = await engine.loadFormatter("bar");

            assert.strictEqual(typeof formatter, "object");
            assert.strictEqual(typeof formatter.format, "function");
        });

        it("should return a formatter object when a formatter is requested, also when the ec0lint-formatter prefix is included in the format argument", async () => {
            const engine = new ESLint({
                cwd: getFixturePath("cli-engine")
            });
            const formatter = await engine.loadFormatter("ec0lint-formatter-bar");

            assert.strictEqual(typeof formatter, "object");
            assert.strictEqual(typeof formatter.format, "function");
        });

        it("should return a formatter object when a formatter is requested within a scoped npm package", async () => {
            const engine = new ESLint({
                cwd: getFixturePath("cli-engine")
            });
            const formatter = await engine.loadFormatter("@somenamespace/foo");

            assert.strictEqual(typeof formatter, "object");
            assert.strictEqual(typeof formatter.format, "function");
        });

        it("should return a formatter object when a formatter is requested within a scoped npm package, also when the ec0lint-formatter prefix is included in the format argument", async () => {
            const engine = new ESLint({
                cwd: getFixturePath("cli-engine")
            });
            const formatter = await engine.loadFormatter("@somenamespace/ec0lint-formatter-foo");

            assert.strictEqual(typeof formatter, "object");
            assert.strictEqual(typeof formatter.format, "function");
        });

        it("should throw if a custom formatter doesn't exist", async () => {
            const engine = new ESLint();
            const formatterPath = getFixturePath("formatters", "doesntexist.js");
            const fullFormatterPath = path.resolve(formatterPath);

            await assert.rejects(async () => {
                await engine.loadFormatter(formatterPath);
            }, new RegExp(escapeStringRegExp(`There was a problem loading formatter: ${fullFormatterPath}\nError: Cannot find module '${fullFormatterPath}'`), "u"));
        });

        it("should throw if a built-in formatter doesn't exist", async () => {
            const engine = new ESLint();
            const fullFormatterPath = path.resolve(__dirname, "../../../lib/cli-engine/formatters/special");

            await assert.rejects(async () => {
                await engine.loadFormatter("special");
            }, new RegExp(escapeStringRegExp(`There was a problem loading formatter: ${fullFormatterPath}\nError: Cannot find module '${fullFormatterPath}'`), "u"));
        });

        it("should throw if the required formatter exists but has an error", async () => {
            const engine = new ESLint();
            const formatterPath = getFixturePath("formatters", "broken.js");

            await assert.rejects(async () => {
                await engine.loadFormatter(formatterPath);
            }, new RegExp(escapeStringRegExp(`There was a problem loading formatter: ${formatterPath}\nError: Cannot find module 'this-module-does-not-exist'`), "u"));
        });

        it("should throw if a non-string formatter name is passed", async () => {
            const engine = new ESLint();

            await assert.rejects(async () => {
                await engine.loadFormatter(5);
            }, /'name' must be a string/u);
        });

        it("should pass cwd to the `cwd` property of the second argument.", async () => {
            const cwd = getFixturePath();
            const engine = new ESLint({ cwd });
            const formatterPath = getFixturePath("formatters", "cwd.js");
            const formatter = await engine.loadFormatter(formatterPath);

            assert.strictEqual(formatter.format([]), cwd);
        });
    });

    describe("getErrorResults()", () => {

        it("should return 0 error or warning messages even when the file has warnings", async () => {
            const engine = new ESLint({
                ignorePath: path.join(fixtureDir, ".ec0lintignore"),
                cwd: path.join(fixtureDir, "..")
            });
            const options = {
                filePath: "fixtures/passing.js",
                warnIgnored: true
            };
            const results = await engine.lintText("var bar = foo;", options);
            const errorReport = ESLint.getErrorResults(results);

            assert.strictEqual(errorReport.length, 0);
            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].errorCount, 0);
            assert.strictEqual(results[0].warningCount, 1);
            assert.strictEqual(results[0].fatalErrorCount, 0);
            assert.strictEqual(results[0].fixableErrorCount, 0);
            assert.strictEqual(results[0].fixableWarningCount, 0);
        });
    });

    describe("getRulesMetaForResults()", () => {
        it("should return empty object when there are no linting errors", async () => {
            const engine = new ESLint({
                useEc0lintrc: false
            });

            const rulesMeta = engine.getRulesMetaForResults([]);

            assert.strictEqual(Object.keys(rulesMeta).length, 0);
        });
    });

    describe("outputFixes()", () => {
        afterEach(() => {
            sinon.verifyAndRestore();
        });

        it("should call fs.writeFile() for each result with output", async () => {
            const fakeFS = {
                writeFile: sinon.spy(callLastArgument)
            };
            const spy = fakeFS.writeFile;
            const { ESLint: localESLint } = proxyquire("../../../lib/ec0lint/ec0lint", {
                fs: fakeFS
            });

            const results = [
                {
                    filePath: path.resolve("foo.js"),
                    output: "bar"
                },
                {
                    filePath: path.resolve("bar.js"),
                    output: "baz"
                }
            ];

            await localESLint.outputFixes(results);

            assert.strictEqual(spy.callCount, 2);
            assert(spy.firstCall.calledWithExactly(path.resolve("foo.js"), "bar", sinon.match.func), "First call was incorrect.");
            assert(spy.secondCall.calledWithExactly(path.resolve("bar.js"), "baz", sinon.match.func), "Second call was incorrect.");
        });

        it("should call fs.writeFile() for each result with output and not at all for a result without output", async () => {
            const fakeFS = {
                writeFile: sinon.spy(callLastArgument)
            };
            const spy = fakeFS.writeFile;
            const { ESLint: localESLint } = proxyquire("../../../lib/ec0lint/ec0lint", {
                fs: fakeFS
            });
            const results = [
                {
                    filePath: path.resolve("foo.js"),
                    output: "bar"
                },
                {
                    filePath: path.resolve("abc.js")
                },
                {
                    filePath: path.resolve("bar.js"),
                    output: "baz"
                }
            ];

            await localESLint.outputFixes(results);

            assert.strictEqual(spy.callCount, 2);
            assert(spy.firstCall.calledWithExactly(path.resolve("foo.js"), "bar", sinon.match.func), "First call was incorrect.");
            assert(spy.secondCall.calledWithExactly(path.resolve("bar.js"), "baz", sinon.match.func), "Second call was incorrect.");
        });

        it("should throw if non object array is given to 'results' parameter", async () => {
            await assert.rejects(() => ESLint.outputFixes(null), /'results' must be an array/u);
            await assert.rejects(() => ESLint.outputFixes([null]), /'results' must include only objects/u);
        });
    });

    describe("when evaluating code when reportUnusedDisableDirectives is enabled", () => {
        it("should report problems for unused ec0lint-disable directives", async () => {
            const eslint = new ESLint({ useEc0lintrc: false, reportUnusedDisableDirectives: "error" });

            assert.deepStrictEqual(
                await eslint.lintText("/* ec0lint-disable */"),
                [
                    {
                        filePath: "<text>",
                        messages: [
                            {
                                ruleId: null,
                                message: "Unused ec0lint-disable directive (no problems were reported).",
                                line: 1,
                                column: 1,
                                fix: {
                                    range: [0, 21],
                                    text: " "
                                },
                                severity: 2,
                                nodeType: null
                            }
                        ],
                        suppressedMessages: [],
                        errorCount: 1,
                        warningCount: 0,
                        fatalErrorCount: 0,
                        fixableErrorCount: 1,
                        fixableWarningCount: 0,
                        source: "/* ec0lint-disable */",
                        usedDeprecatedRules: []
                    }
                ]
            );
        });
    });

    describe("when retreiving version number", () => {
        it("should return current version number", () => {
            const eslintCLI = require("../../../lib/ec0lint").ESLint;
            const version = eslintCLI.version;

            assert.strictEqual(typeof version, "string");
            assert(parseInt(version[0], 10) >= 0);
        });
    });

    describe("mutability", () => {
        describe("plugins", () => {
            it("Loading plugin in one instance doesn't mutate to another instance", async () => {
                const filePath = getFixturePath("single-quoted.js");
                const engine1 = eslintWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    overrideConfig: {
                        plugins: ["example"],
                        rules: { "example/example-rule": 1 }
                    }
                });
                const engine2 = new ESLint({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false
                });
                const fileConfig1 = await engine1.calculateConfigForFile(filePath);
                const fileConfig2 = await engine2.calculateConfigForFile(filePath);

                // plugin
                assert.deepStrictEqual(fileConfig1.plugins, ["example"], "Plugin is present for engine 1");
                assert.deepStrictEqual(fileConfig2.plugins, [], "Plugin is not present for engine 2");
            });
        });

        describe("rules", () => {
            it("Loading rules in one instance doesn't mutate to another instance", async () => {
                const filePath = getFixturePath("single-quoted.js");
                const engine1 = new ESLint({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    overrideConfig: { rules: { "example/example-rule": 1 } }
                });
                const engine2 = new ESLint({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false
                });
                const fileConfig1 = await engine1.calculateConfigForFile(filePath);
                const fileConfig2 = await engine2.calculateConfigForFile(filePath);

                // plugin
                assert.deepStrictEqual(fileConfig1.rules["example/example-rule"], [1], "example is present for engine 1");
                assert.strictEqual(fileConfig2.rules["example/example-rule"], void 0, "example is not present for engine 2");
            });
        });
    });

    describe("with ignorePatterns config", () => {
        const root = getFixturePath("cli-engine/ignore-patterns");

        describe("ignorePatterns can add an ignore pattern ('foo.js').", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": {
                        ignorePatterns: "foo.js"
                    },
                    "foo.js": "",
                    "bar.js": "",
                    "subdir/foo.js": "",
                    "subdir/bar.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
                assert.strictEqual(await engine.isPathIgnored("subdir/foo.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for 'bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("bar.js"), false);
                assert.strictEqual(await engine.isPathIgnored("subdir/bar.js"), false);
            });

            it("'lintFiles()' should not verify 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar.js"),
                    path.join(root, "subdir/bar.js")
                ]);
            });
        });

        describe("ignorePatterns can add ignore patterns ('foo.js', '/bar.js').", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": {
                        ignorePatterns: ["foo.js", "/bar.js"]
                    },
                    "foo.js": "",
                    "bar.js": "",
                    "baz.js": "",
                    "subdir/foo.js": "",
                    "subdir/bar.js": "",
                    "subdir/baz.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
                assert.strictEqual(await engine.isPathIgnored("subdir/foo.js"), true);
            });

            it("'isPathIgnored()' should return 'true' for '/bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("bar.js"), true);
                assert.strictEqual(await engine.isPathIgnored("subdir/bar.js"), false);
            });

            it("'lintFiles()' should not verify 'foo.js' and '/bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "baz.js"),
                    path.join(root, "subdir/bar.js"),
                    path.join(root, "subdir/baz.js")
                ]);
            });
        });

        describe("ignorePatterns can unignore '/node_modules/foo'.", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": {
                        ignorePatterns: "!/node_modules/foo"
                    },
                    "node_modules/foo/index.js": "",
                    "node_modules/foo/.dot.js": "",
                    "node_modules/bar/index.js": "",
                    "foo.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'false' for 'node_modules/foo/index.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("node_modules/foo/index.js"), false);
            });

            it("'isPathIgnored()' should return 'true' for 'node_modules/foo/.dot.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("node_modules/foo/.dot.js"), true);
            });

            it("'isPathIgnored()' should return 'true' for 'node_modules/bar/index.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("node_modules/bar/index.js"), true);
            });

            it("'lintFiles()' should verify 'node_modules/foo/index.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "foo.js"),
                    path.join(root, "node_modules/foo/index.js")
                ]);
            });
        });

        describe("ignorePatterns can unignore '.ec0lintrc.js'.", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.js": `module.exports = ${JSON.stringify({
                        ignorePatterns: "!.ec0lintrc.js"
                    })}`,
                    "foo.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'false' for '.ec0lintrc.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored(".ec0lintrc.js"), false);
            });

            it("'lintFiles()' should verify '.ec0lintrc.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, ".ec0lintrc.js"),
                    path.join(root, "foo.js")
                ]);
            });
        });

        describe(".ec0lintignore can re-ignore files that are unignored by ignorePatterns.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.js": `module.exports = ${JSON.stringify({
                        ignorePatterns: "!.*"
                    })}`,
                    ".ec0lintignore": ".foo*",
                    ".foo.js": "",
                    ".bar.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for re-ignored '.foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored(".foo.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for unignored '.bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored(".bar.js"), false);
            });

            it("'lintFiles()' should not verify re-ignored '.foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, ".bar.js"),
                    path.join(root, ".ec0lintrc.js")
                ]);
            });
        });

        describe(".ec0lintignore can unignore files that are ignored by ignorePatterns.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.js": `module.exports = ${JSON.stringify({
                        ignorePatterns: "*.js"
                    })}`,
                    ".ec0lintignore": "!foo.js",
                    "foo.js": "",
                    "bar.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'false' for unignored 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), false);
            });

            it("'isPathIgnored()' should return 'true' for ignored 'bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("bar.js"), true);
            });

            it("'lintFiles()' should verify unignored 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "foo.js")
                ]);
            });
        });

        describe("ignorePatterns in the config file in a child directory affects to only in the directory.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({
                        ignorePatterns: "foo.js"
                    }),
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        ignorePatterns: "bar.js"
                    }),
                    "foo.js": "",
                    "bar.js": "",
                    "subdir/foo.js": "",
                    "subdir/bar.js": "",
                    "subdir/subsubdir/foo.js": "",
                    "subdir/subsubdir/bar.js": ""
                }
            });


            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
                assert.strictEqual(await engine.isPathIgnored("subdir/foo.js"), true);
                assert.strictEqual(await engine.isPathIgnored("subdir/subsubdir/foo.js"), true);
            });

            it("'isPathIgnored()' should return 'true' for 'bar.js' in 'subdir'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("subdir/bar.js"), true);
                assert.strictEqual(await engine.isPathIgnored("subdir/subsubdir/bar.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for 'bar.js' in the outside of 'subdir'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("bar.js"), false);
            });

            it("'lintFiles()' should verify 'bar.js' in the outside of 'subdir'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar.js")
                ]);
            });
        });

        describe("ignorePatterns in the config file in a child directory can unignore the ignored files in the parent directory's config.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({
                        ignorePatterns: "foo.js"
                    }),
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        ignorePatterns: "!foo.js"
                    }),
                    "foo.js": "",
                    "subdir/foo.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js' in the root directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for 'foo.js' in the child directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("subdir/foo.js"), false);
            });

            it("'lintFiles()' should verify 'foo.js' in the child directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "subdir/foo.js")
                ]);
            });
        });

        describe(".ec0lintignore can unignore files that are ignored by ignorePatterns in the config file in the child directory.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({}),
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        ignorePatterns: "*.js"
                    }),
                    ".ec0lintignore": "!foo.js",
                    "foo.js": "",
                    "subdir/foo.js": "",
                    "subdir/bar.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'false' for unignored 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), false);
                assert.strictEqual(await engine.isPathIgnored("subdir/foo.js"), false);
            });

            it("'isPathIgnored()' should return 'true' for ignored 'bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("subdir/bar.js"), true);
            });

            it("'lintFiles()' should verify unignored 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "foo.js"),
                    path.join(root, "subdir/foo.js")
                ]);
            });
        });

        describe("if the config in a child directory has 'root:true', ignorePatterns in the config file in the parent directory should not be used.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({
                        ignorePatterns: "foo.js"
                    }),
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        root: true,
                        ignorePatterns: "bar.js"
                    }),
                    "foo.js": "",
                    "bar.js": "",
                    "subdir/foo.js": "",
                    "subdir/bar.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js' in the root directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for 'bar.js' in the root directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("bar.js"), false);
            });

            it("'isPathIgnored()' should return 'false' for 'foo.js' in the child directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("subdir/foo.js"), false);
            });

            it("'isPathIgnored()' should return 'true' for 'bar.js' in the child directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("subdir/bar.js"), true);
            });

            it("'lintFiles()' should verify 'bar.js' in the root directory and 'foo.js' in the child directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar.js"),
                    path.join(root, "subdir/foo.js")
                ]);
            });
        });

        describe("even if the config in a child directory has 'root:true', .ec0lintignore should be used.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({}),
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        root: true,
                        ignorePatterns: "bar.js"
                    }),
                    ".ec0lintignore": "foo.js",
                    "foo.js": "",
                    "bar.js": "",
                    "subdir/foo.js": "",
                    "subdir/bar.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
                assert.strictEqual(await engine.isPathIgnored("subdir/foo.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for 'bar.js' in the root directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("bar.js"), false);
            });

            it("'isPathIgnored()' should return 'true' for 'bar.js' in the child directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("subdir/bar.js"), true);
            });

            it("'lintFiles()' should verify 'bar.js' in the root directory.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar.js")
                ]);
            });
        });

        describe("ignorePatterns in the shareable config should be used.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    "node_modules/ec0lint-config-one/index.js": `module.exports = ${JSON.stringify({
                        ignorePatterns: "foo.js"
                    })}`,
                    ".ec0lintrc.json": JSON.stringify({
                        extends: "one"
                    }),
                    "foo.js": "",
                    "bar.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for 'bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("bar.js"), false);
            });

            it("'lintFiles()' should verify 'bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar.js")
                ]);
            });
        });

        describe("ignorePatterns in the shareable config should be relative to the entry config file.", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    "node_modules/ec0lint-config-one/index.js": `module.exports = ${JSON.stringify({
                        ignorePatterns: "/foo.js"
                    })}`,
                    ".ec0lintrc.json": JSON.stringify({
                        extends: "one"
                    }),
                    "foo.js": "",
                    "subdir/foo.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for 'subdir/foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("subdir/foo.js"), false);
            });

            it("'lintFiles()' should verify 'subdir/foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "subdir/foo.js")
                ]);
            });
        });

        describe("ignorePatterns in a config file can unignore the files which are ignored by ignorePatterns in the shareable config.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    "node_modules/ec0lint-config-one/index.js": `module.exports = ${JSON.stringify({
                        ignorePatterns: "*.js"
                    })}`,
                    ".ec0lintrc.json": JSON.stringify({
                        extends: "one",
                        ignorePatterns: "!bar.js"
                    }),
                    "foo.js": "",
                    "bar.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'true' for 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), true);
            });

            it("'isPathIgnored()' should return 'false' for 'bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });

                assert.strictEqual(await engine.isPathIgnored("bar.js"), false);
            });

            it("'lintFiles()' should verify 'bar.js'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar.js")
                ]);
            });
        });

        describe("ignorePatterns in a config file should not be used if --no-ignore option was given.", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({
                        ignorePatterns: "*.js"
                    }),
                    "foo.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'isPathIgnored()' should return 'false' for 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath(), ignore: false });

                assert.strictEqual(await engine.isPathIgnored("foo.js"), false);
            });

            it("'lintFiles()' should verify 'foo.js'.", async () => {
                const engine = new ESLint({ cwd: getPath(), ignore: false });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "foo.js")
                ]);
            });
        });

        describe("ignorePatterns in overrides section is not allowed.", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.js": `module.exports = ${JSON.stringify({
                        overrides: [
                            {
                                files: "*.js",
                                ignorePatterns: "foo.js"
                            }
                        ]
                    })}`,
                    "foo.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("should throw a configuration error.", async () => {
                await assert.rejects(async () => {
                    const engine = new ESLint({ cwd: getPath() });

                    await engine.lintFiles("*.js");
                }, /Unexpected top-level property "overrides\[0\]\.ignorePatterns"/u);
            });
        });
    });

    describe("'overrides[].files' adds lint targets", () => {
        const root = getFixturePath("cli-engine/additional-lint-targets");


        describe("if { files: 'foo/*.txt', excludedFiles: '**/ignore.txt' } is present,", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({
                        overrides: [
                            {
                                files: "foo/*.txt",
                                excludedFiles: "**/ignore.txt"
                            }
                        ]
                    }),
                    "foo/nested/test.txt": "",
                    "foo/test.js": "",
                    "foo/test.txt": "",
                    "foo/ignore.txt": "",
                    "bar/test.js": "",
                    "bar/test.txt": "",
                    "bar/ignore.txt": "",
                    "test.js": "",
                    "test.txt": "",
                    "ignore.txt": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'lintFiles()' with a directory path should contain 'foo/test.txt'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("."))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar/test.js"),
                    path.join(root, "foo/test.js"),
                    path.join(root, "foo/test.txt"),
                    path.join(root, "test.js")
                ]);
            });

            it("'lintFiles()' with a glob pattern '*.js' should not contain 'foo/test.txt'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("**/*.js"))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar/test.js"),
                    path.join(root, "foo/test.js"),
                    path.join(root, "test.js")
                ]);
            });
        });

        describe("if { files: 'foo/**/*.txt' } is present,", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({
                        overrides: [
                            {
                                files: "foo/**/*.txt"
                            }
                        ]
                    }),
                    "foo/nested/test.txt": "",
                    "foo/test.js": "",
                    "foo/test.txt": "",
                    "bar/test.js": "",
                    "bar/test.txt": "",
                    "test.js": "",
                    "test.txt": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'lintFiles()' with a directory path should contain 'foo/test.txt' and 'foo/nested/test.txt'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("."))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar/test.js"),
                    path.join(root, "foo/nested/test.txt"),
                    path.join(root, "foo/test.js"),
                    path.join(root, "foo/test.txt"),
                    path.join(root, "test.js")
                ]);
            });
        });

        describe("if { files: 'foo/**/*' } is present,", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    ".ec0lintrc.json": JSON.stringify({
                        overrides: [
                            {
                                files: "foo/**/*"
                            }
                        ]
                    }),
                    "foo/nested/test.txt": "",
                    "foo/test.js": "",
                    "foo/test.txt": "",
                    "bar/test.js": "",
                    "bar/test.txt": "",
                    "test.js": "",
                    "test.txt": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'lintFiles()' with a directory path should NOT contain 'foo/test.txt' and 'foo/nested/test.txt'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("."))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar/test.js"),
                    path.join(root, "foo/test.js"),
                    path.join(root, "test.js")
                ]);
            });
        });

        describe("if { files: 'foo/**/*.txt' } is present in a shareable config,", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    "node_modules/ec0lint-config-foo/index.js": `module.exports = ${JSON.stringify({
                        overrides: [
                            {
                                files: "foo/**/*.txt"
                            }
                        ]
                    })}`,
                    ".ec0lintrc.json": JSON.stringify({
                        extends: "foo"
                    }),
                    "foo/nested/test.txt": "",
                    "foo/test.js": "",
                    "foo/test.txt": "",
                    "bar/test.js": "",
                    "bar/test.txt": "",
                    "test.js": "",
                    "test.txt": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'lintFiles()' with a directory path should contain 'foo/test.txt' and 'foo/nested/test.txt'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("."))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar/test.js"),
                    path.join(root, "foo/nested/test.txt"),
                    path.join(root, "foo/test.js"),
                    path.join(root, "foo/test.txt"),
                    path.join(root, "test.js")
                ]);
            });
        });

        describe("if { files: 'foo/**/*.txt' } is present in a plugin config,", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: root,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": `exports.configs = ${JSON.stringify({
                        bar: {
                            overrides: [
                                {
                                    files: "foo/**/*.txt"
                                }
                            ]
                        }
                    })}`,
                    ".ec0lintrc.json": JSON.stringify({
                        extends: "plugin:foo/bar"
                    }),
                    "foo/nested/test.txt": "",
                    "foo/test.js": "",
                    "foo/test.txt": "",
                    "bar/test.js": "",
                    "bar/test.txt": "",
                    "test.js": "",
                    "test.txt": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'lintFiles()' with a directory path should contain 'foo/test.txt' and 'foo/nested/test.txt'.", async () => {
                const engine = new ESLint({ cwd: getPath() });
                const filePaths = (await engine.lintFiles("."))
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar/test.js"),
                    path.join(root, "foo/nested/test.txt"),
                    path.join(root, "foo/test.js"),
                    path.join(root, "foo/test.txt"),
                    path.join(root, "test.js")
                ]);
            });
        });
    });
});
