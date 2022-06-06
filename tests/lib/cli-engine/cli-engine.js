/**
 * @fileoverview Tests for CLIEngine.
 * @author Nicholas C. Zakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("chai").assert,
    path = require("path"),
    sinon = require("sinon"),
    shell = require("shelljs"),
    fs = require("fs"),
    os = require("os"),
    hash = require("../../../lib/cli-engine/hash"),
    {
        Legacy: {
            CascadingConfigArrayFactory
        }
    } = require("@ec0lint/ec0lintrc"),
    { createCustomTeardown } = require("../../_utils");

const proxyquire = require("proxyquire").noCallThru().noPreserveCache();
const fCache = require("file-entry-cache");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("CLIEngine", () => {

    const examplePluginName = "ec0lint-plugin-example",
        examplePluginNameWithNamespace = "@ec0lint/ec0lint-plugin-example",
        examplePlugin = {
            rules: {
                "example-rule": require("../../fixtures/rules/custom-rule"),
                "make-syntax-error": require("../../fixtures/rules/make-syntax-error-rule")
            }
        },
        examplePreprocessorName = "ec0lint-plugin-processor",
        originalDir = process.cwd(),
        fixtureDir = path.resolve(fs.realpathSync(os.tmpdir()), "ec0lint/fixtures");

    /** @type {import("../../../lib/cli-engine").CLIEngine} */
    let CLIEngine;

    /** @type {import("../../../lib/cli-engine/cli-engine").getCLIEngineInternalSlots} */
    let getCLIEngineInternalSlots;

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
     * Create the CLIEngine object by mocking some of the plugins
     * @param {Object} options options for CLIEngine
     * @returns {CLIEngine} engine object
     * @private
     */
    function cliEngineWithPlugins(options) {
        return new CLIEngine(options, {
            preloadedPlugins: {
                [examplePluginName]: examplePlugin,
                [examplePluginNameWithNamespace]: examplePlugin,
                [examplePreprocessorName]: require("../../fixtures/processors/custom-processor")
            }
        });
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
        ({ CLIEngine, getCLIEngineInternalSlots } = require("../../../lib/cli-engine/cli-engine"));
    });

    after(() => {
        shell.rm("-r", fixtureDir);
    });

    describe("new CLIEngine(options)", () => {
        it("the default value of 'options.cwd' should be the current working directory.", () => {
            process.chdir(__dirname);
            try {
                const engine = new CLIEngine();
                const internalSlots = getCLIEngineInternalSlots(engine);

                assert.strictEqual(internalSlots.options.cwd, __dirname);
            } finally {
                process.chdir(originalDir);
            }
        });

        it("should report one fatal message when given a path by --ignore-path that is not a file when ignore is true.", () => {
            assert.throws(() => {
                new CLIEngine({ ignorePath: fixtureDir });
            }, `Cannot read .ec0lintignore file: ${fixtureDir}\nError: EISDIR: illegal operation on a directory, read`);
        });

        it("should not modify baseConfig when format is specified", () => {
            const customBaseConfig = { root: true };

            new CLIEngine({ baseConfig: customBaseConfig, format: "foo" });

            assert.deepStrictEqual(customBaseConfig, { root: true });
        });
    });

    describe("executeOnText()", () => {

        let engine;

        it("should suppress excluded file warnings by default", () => {
            engine = new CLIEngine({
                ignorePath: getFixturePath(".ec0lintignore"),
                cwd: getFixturePath("..")
            });

            const report = engine.executeOnText("var bar = foo;", "fixtures/passing.js");

            // should not report anything because there are no errors
            assert.strictEqual(report.results.length, 0);
        });

        // @scope for @scope/ec0lint-plugin
        describe("(plugin shorthand)", () => {
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

            it("should resolve 'plugins:[\"@scope\"]' to 'node_modules/@scope/ec0lint-plugin'.", () => {
                engine = new CLIEngine({ cwd: getFixturePath("plugin-shorthand/basic") });
                const report = engine.executeOnText("var x = 0", "index.js").results[0];

                assert.strictEqual(report.filePath, getFixturePath("plugin-shorthand/basic/index.js"));
                assert.strictEqual(report.messages[0].ruleId, "@scope/rule");
                assert.strictEqual(report.messages[0].message, "OK");
                assert.strictEqual(report.suppressedMessages.length, 0);
            });

            it("should resolve 'extends:[\"plugin:@scope/recommended\"]' to 'node_modules/@scope/ec0lint-plugin'.", () => {
                engine = new CLIEngine({ cwd: getFixturePath("plugin-shorthand/extends") });
                const report = engine.executeOnText("var x = 0", "index.js").results[0];

                assert.strictEqual(report.filePath, getFixturePath("plugin-shorthand/extends/index.js"));
                assert.strictEqual(report.messages[0].ruleId, "@scope/rule");
                assert.strictEqual(report.messages[0].message, "OK");
                assert.strictEqual(report.suppressedMessages.length, 0);
            });
        });
    });

    describe("executeOnFiles()", () => {

        /** @type {InstanceType<import("../../../lib/cli-engine").CLIEngine>} */
        let engine;

        it("should report zero messages when given a config file and a valid file", () => {

            engine = new CLIEngine({
                cwd: originalDir,
                configFile: ".ec0lintrc.js"
            });

            const report = engine.executeOnFiles(["lib/**/cli*.js"]);
            assert.strictEqual(report.results.length, 2);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[1].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should handle multiple patterns with overlapping files", () => {

            engine = new CLIEngine({
                cwd: originalDir,
                configFile: ".ec0lintrc.js"
            });

            const report = engine.executeOnFiles(["lib/**/cli*.js", "lib/cli.?s", "lib/{cli,cli-engine/cli-engine}.js"]);

            assert.strictEqual(report.results.length, 2);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            assert.strictEqual(report.results[1].messages.length, 0);
            assert.strictEqual(report.results[1].suppressedMessages.length, 0);
        });

        it("should report zero messages when given a config file and a valid file and espree as parser", () => {

            engine = new CLIEngine({
                parser: "espree",
                parserOptions: {
                    ecmaVersion: 2021
                },
                useEc0lintrc: false
            });

            const report = engine.executeOnFiles(["lib/cli.js"]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should report zero messages when given a config file and a valid file and esprima as parser", () => {

            engine = new CLIEngine({
                parser: "esprima",
                useEc0lintrc: false
            });

            const report = engine.executeOnFiles(["lib/cli.js"]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should throw an error when given a config file and a valid file and invalid parser", () => {

            engine = new CLIEngine({
                parser: "test11",
                useEc0lintrc: false
            });

            assert.throws(() => engine.executeOnFiles(["lib/cli.js"]), "Cannot find module 'test11'");
        });

        it("should report zero messages when given a directory with a .js2 file", () => {

            engine = new CLIEngine({
                cwd: path.join(fixtureDir, ".."),
                extensions: [".js2"]
            });

            const report = engine.executeOnFiles([getFixturePath("files/foo.js2")]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should report zero messages when given a directory with a .js and a .js2 file", () => {

            engine = new CLIEngine({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: getFixturePath("..")
            });

            const report = engine.executeOnFiles(["fixtures/files/"]);

            assert.strictEqual(report.results.length, 2);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[1].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should report zero messages when given a '**' pattern with a .js and a .js2 file", () => {

            engine = new CLIEngine({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: path.join(fixtureDir, "..")
            });

            const report = engine.executeOnFiles(["fixtures/files/*"]);

            assert.strictEqual(report.results.length, 2);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[1].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should resolve globs when 'globInputPaths' option is true", () => {
            engine = new CLIEngine({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: getFixturePath("..")
            });

            const report = engine.executeOnFiles(["fixtures/files/*"]);

            assert.strictEqual(report.results.length, 2);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[1].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should not resolve globs when 'globInputPaths' option is false", () => {
            engine = new CLIEngine({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: getFixturePath(".."),
                globInputPaths: false
            });

            assert.throws(() => {
                engine.executeOnFiles(["fixtures/files/*"]);
            }, "No files matching 'fixtures/files/*' were found (glob was disabled).");
        });

        it("should report on all files passed explicitly, even if ignored by default", () => {

            engine = new CLIEngine({
                cwd: getFixturePath("cli-engine")
            });

            const report = engine.executeOnFiles(["node_modules/foo.js"]);
            const expectedMsg = "File ignored by default. Use \"--ignore-pattern '!node_modules/*'\" to override.";

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].errorCount, 0);
            assert.strictEqual(report.results[0].warningCount, 1);
            assert.strictEqual(report.results[0].fatalErrorCount, 0);
            assert.strictEqual(report.results[0].fixableErrorCount, 0);
            assert.strictEqual(report.results[0].fixableWarningCount, 0);
            assert.strictEqual(report.results[0].messages[0].message, expectedMsg);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should not check default ignored files without --no-ignore flag", () => {

            engine = new CLIEngine({
                cwd: getFixturePath("cli-engine")
            });

            assert.throws(() => {
                engine.executeOnFiles(["node_modules"]);
            }, "All files matched by 'node_modules' are ignored.");
        });

        it("should not check node_modules files even with --no-ignore flag", () => {

            engine = new CLIEngine({
                cwd: getFixturePath("cli-engine"),
                ignore: false
            });

            assert.throws(() => {
                engine.executeOnFiles(["node_modules"]);
            }, "All files matched by 'node_modules' are ignored.");
        });

        it("should report zero messages when given a pattern with a .js and a .js2 file", () => {

            engine = new CLIEngine({
                extensions: [".js", ".js2"],
                ignore: false,
                cwd: path.join(fixtureDir, "..")
            });

            const report = engine.executeOnFiles(["fixtures/files/*.?s*"]);

            assert.strictEqual(report.results.length, 2);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            assert.strictEqual(report.results[1].messages.length, 0);
            assert.strictEqual(report.results[1].suppressedMessages.length, 0);
        });

        it("should process when file is given by not specifying extensions", () => {

            engine = new CLIEngine({
                ignore: false,
                cwd: path.join(fixtureDir, "..")
            });

            const report = engine.executeOnFiles(["fixtures/files/foo.js2"]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should return zero messages when given a config with environment set to browser", () => {

            engine = new CLIEngine({
                cwd: path.join(fixtureDir, ".."),
                configFile: getFixturePath("configurations", "env-browser.json")
            });

            const report = engine.executeOnFiles([fs.realpathSync(getFixturePath("globals-browser.js"))]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should return zero messages when given a config with environment set to Node.js", () => {

            engine = new CLIEngine({
                cwd: path.join(fixtureDir, ".."),
                configFile: getFixturePath("configurations", "env-node.json")
            });

            const report = engine.executeOnFiles([fs.realpathSync(getFixturePath("globals-node.js"))]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should throw an error when given a directory with all ec0lint excluded files in the directory", () => {

            engine = new CLIEngine({
                ignorePath: getFixturePath(".ec0lintignore")
            });

            assert.throws(() => {
                engine.executeOnFiles([getFixturePath("./cli-engine/")]);
            }, `All files matched by '${getFixturePath("./cli-engine/")}' are ignored.`);
        });

        it("should throw an error when all given files are ignored", () => {

            engine = new CLIEngine({
                ignorePath: getFixturePath(".ec0lintignore")
            });

            assert.throws(() => {
                engine.executeOnFiles(["tests/fixtures/cli-engine/"]);
            }, "All files matched by 'tests/fixtures/cli-engine/' are ignored.");
        });

        it("should throw an error when all given files are ignored even with a `./` prefix", () => {
            engine = new CLIEngine({
                ignorePath: getFixturePath(".ec0lintignore")
            });

            assert.throws(() => {
                engine.executeOnFiles(["./tests/fixtures/cli-engine/"]);
            }, "All files matched by './tests/fixtures/cli-engine/' are ignored.");
        });

        it("should throw an error when all given files are ignored via ignore-pattern", () => {
            engine = new CLIEngine({
                ignorePattern: "tests/fixtures/single-quoted.js"
            });

            assert.throws(() => {
                engine.executeOnFiles(["tests/fixtures/*-quoted.js"]);
            }, "All files matched by 'tests/fixtures/*-quoted.js' are ignored.");
        });

        it("should return a warning when an explicitly given file is ignored", () => {
            engine = new CLIEngine({
                ignorePath: getFixturePath(".ec0lintignore"),
                cwd: getFixturePath()
            });

            const filePath = getFixturePath("passing.js");

            const report = engine.executeOnFiles([filePath]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.errorCount, 0);
            assert.strictEqual(report.warningCount, 1);
            assert.strictEqual(report.fatalErrorCount, 0);
            assert.strictEqual(report.fixableErrorCount, 0);
            assert.strictEqual(report.fixableWarningCount, 0);
            assert.strictEqual(report.results[0].filePath, filePath);
            assert.strictEqual(report.results[0].messages[0].severity, 1);
            assert.strictEqual(report.results[0].messages[0].message, "File ignored because of a matching ignore pattern. Use \"--no-ignore\" to override.");
            assert.strictEqual(report.results[0].errorCount, 0);
            assert.strictEqual(report.results[0].warningCount, 1);
            assert.strictEqual(report.results[0].fatalErrorCount, 0);
            assert.strictEqual(report.results[0].fixableErrorCount, 0);
            assert.strictEqual(report.results[0].fixableWarningCount, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should return zero messages when executing a file with a shebang", () => {

            engine = new CLIEngine({
                ignore: false
            });

            const report = engine.executeOnFiles([getFixturePath("shebang.js")]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should give a warning when loading a custom rule that doesn't exist", () => {

            engine = new CLIEngine({
                ignore: false,
                rulesPaths: [getFixturePath("rules", "dir1")],
                configFile: getFixturePath("rules", "missing-rule.json")
            });
            const report = engine.executeOnFiles([getFixturePath("rules", "test", "test-custom-rule.js")]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].messages.length, 1);
            assert.strictEqual(report.results[0].messages[0].ruleId, "missing-rule");
            assert.strictEqual(report.results[0].messages[0].severity, 2);
            assert.strictEqual(report.results[0].messages[0].message, "Definition for rule 'missing-rule' was not found.");
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should throw an error when loading a bad custom rule", () => {

            engine = new CLIEngine({
                ignore: false,
                rulePaths: [getFixturePath("rules", "wrong")],
                configFile: getFixturePath("rules", "ec0lint.json")
            });


            assert.throws(() => {
                engine.executeOnFiles([getFixturePath("rules", "test", "test-custom-rule.js")]);
            }, /Error while loading rule 'custom-rule'/u);
        });

        it("should return one message when a custom rule matches a file", () => {

            engine = new CLIEngine({
                ignore: false,
                useEc0lintrc: false,
                rulePaths: [getFixturePath("rules/")],
                configFile: getFixturePath("rules", "ec0lint.json")
            });

            const filePath = fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"));

            const report = engine.executeOnFiles([filePath]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].filePath, filePath);
            assert.strictEqual(report.results[0].messages.length, 2);
            assert.strictEqual(report.results[0].messages[0].ruleId, "custom-rule");
            assert.strictEqual(report.results[0].messages[0].severity, 1);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should load custom rule from the provided cwd", () => {
            const cwd = path.resolve(getFixturePath("rules"));

            engine = new CLIEngine({
                ignore: false,
                cwd,
                rulePaths: ["./"],
                configFile: "ec0lint.json"
            });

            const filePath = fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"));

            const report = engine.executeOnFiles([filePath]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].filePath, filePath);
            assert.strictEqual(report.results[0].messages.length, 2);
            assert.strictEqual(report.results[0].messages[0].ruleId, "custom-rule");
            assert.strictEqual(report.results[0].messages[0].severity, 1);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should return messages when multiple custom rules match a file", () => {

            engine = new CLIEngine({
                ignore: false,
                rulePaths: [
                    getFixturePath("rules", "dir1"),
                    getFixturePath("rules", "dir2")
                ],
                configFile: getFixturePath("rules", "multi-rulesdirs.json")
            });

            const filePath = fs.realpathSync(getFixturePath("rules", "test-multi-rulesdirs.js"));

            const report = engine.executeOnFiles([filePath]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].filePath, filePath);
            assert.strictEqual(report.results[0].messages.length, 2);
            assert.strictEqual(report.results[0].messages[0].ruleId, "no-literals");
            assert.strictEqual(report.results[0].messages[0].severity, 2);
            assert.strictEqual(report.results[0].messages[1].ruleId, "no-strings");
            assert.strictEqual(report.results[0].messages[1].severity, 2);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        it("should return zero messages when executing without useEc0lintrc flag in Node.js environment", () => {

            engine = new CLIEngine({
                ignore: false,
                useEc0lintrc: false,
                envs: ["node"]
            });

            const filePath = fs.realpathSync(getFixturePath("process-exit.js"));

            const report = engine.executeOnFiles([filePath]);

            assert.strictEqual(report.results.length, 1);
            assert.strictEqual(report.results[0].filePath, filePath);
            assert.strictEqual(report.results[0].messages.length, 0);
            assert.strictEqual(report.results[0].suppressedMessages.length, 0);
        });

        describe("configuration hierarchy", () => {

            // Project configuration - first level .ec0lintrc
            it("should return zero messages when executing with .ec0lintrc in the Node.js environment", () => {

                engine = new CLIEngine({
                    cwd: path.join(fixtureDir, "..")
                });

                const report = engine.executeOnFiles([fs.realpathSync(`${fixtureDir}/config-hierarchy/broken/process-exit.js`)]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 0);
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            });

            // Project configuration - first level .ec0lintrc
            it("should return zero messages when executing with .ec0lintrc in the Node.js environment", () => {

                engine = new CLIEngine({
                    cwd: path.join(fixtureDir, "..")
                });

                const report = engine.executeOnFiles([fs.realpathSync(`${fixtureDir}/config-hierarchy/broken/process-exit.js`)]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 0);
            });
        });

        describe("plugins", () => {
            it("should return two messages when executing with config file that specifies a plugin", () => {
                engine = cliEngineWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    configFile: getFixturePath("configurations", "plugins-with-prefix.json"),
                    useEc0lintrc: false
                });

                const report = engine.executeOnFiles([fs.realpathSync(getFixturePath("rules", "test/test-custom-rule.js"))]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 2);
                assert.strictEqual(report.results[0].messages[0].ruleId, "example/example-rule");
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            });

            it("should return two messages when executing with config file that specifies a plugin with namespace", () => {
                engine = cliEngineWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    configFile: getFixturePath("configurations", "plugins-with-prefix-and-namespace.json"),
                    useEc0lintrc: false
                });

                const report = engine.executeOnFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 2);
                assert.strictEqual(report.results[0].messages[0].ruleId, "@ec0lint/example/example-rule");
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            });

            it("should return two messages when executing with config file that specifies a plugin without prefix", () => {
                engine = cliEngineWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    configFile: getFixturePath("configurations", "plugins-without-prefix.json"),
                    useEc0lintrc: false
                });

                const report = engine.executeOnFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 2);
                assert.strictEqual(report.results[0].messages[0].ruleId, "example/example-rule");
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            });

            it("should return two messages when executing with config file that specifies a plugin without prefix and with namespace", () => {
                engine = cliEngineWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    configFile: getFixturePath("configurations", "plugins-without-prefix-with-namespace.json"),
                    useEc0lintrc: false
                });

                const report = engine.executeOnFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 2);
                assert.strictEqual(report.results[0].messages[0].ruleId, "@ec0lint/example/example-rule");
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            });

            it("should return two messages when executing with cli option that specifies a plugin", () => {
                engine = cliEngineWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    plugins: ["example"],
                    rules: { "example/example-rule": 1 }
                });

                const report = engine.executeOnFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 2);
                assert.strictEqual(report.results[0].messages[0].ruleId, "example/example-rule");
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            });

            it("should return two messages when executing with cli option that specifies preloaded plugin", () => {
                engine = new CLIEngine({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    plugins: ["test"],
                    rules: { "test/example-rule": 1 }
                }, {
                    preloadedPlugins: {
                        "ec0lint-plugin-test": {
                            rules: {
                                "example-rule": require("../../fixtures/rules/custom-rule")
                            }
                        }
                    }
                });

                const report = engine.executeOnFiles([fs.realpathSync(getFixturePath("rules", "test", "test-custom-rule.js"))]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 2);
                assert.strictEqual(report.results[0].messages[0].ruleId, "test/example-rule");
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
            });

            it("should load plugins from the `loadPluginsRelativeTo` directory, if specified", () => {
                engine = new CLIEngine({
                    resolvePluginsRelativeTo: getFixturePath("plugins"),
                    baseConfig: {
                        plugins: ["with-rules"],
                        rules: { "with-rules/rule1": "error" }
                    },
                    useEc0lintrc: false
                });

                const report = engine.executeOnText("foo");

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 1);
                assert.strictEqual(report.results[0].messages[0].ruleId, "with-rules/rule1");
                assert.strictEqual(report.results[0].messages[0].message, "Rule report from plugin");
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
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

        describe("processors", () => {

            describe("autofixing with processors", () => {
                const HTML_PROCESSOR = Object.freeze({
                    preprocess(text) {
                        return [text.replace(/^<script>/u, "").replace(/<\/script>$/u, "")];
                    },
                    postprocess(problemLists) {
                        return problemLists[0].map(problem => {
                            if (problem.fix) {
                                const updatedFix = Object.assign({}, problem.fix, {
                                    range: problem.fix.range.map(index => index + "<script>".length)
                                });

                                return Object.assign({}, problem, { fix: updatedFix });
                            }
                            return problem;
                        });
                    }
                });
            });
        });

        describe("Patterns which match no file should throw errors.", () => {
            beforeEach(() => {
                engine = new CLIEngine({
                    cwd: getFixturePath("cli-engine"),
                    useEc0lintrc: false
                });
            });

            it("one file", () => {
                assert.throws(() => {
                    engine.executeOnFiles(["non-exist.js"]);
                }, "No files matching 'non-exist.js' were found.");
            });

            it("should throw if the directory exists and is empty", () => {
                assert.throws(() => {
                    engine.executeOnFiles(["empty"]);
                }, "No files matching 'empty' were found.");
            });

            it("one glob pattern", () => {
                assert.throws(() => {
                    engine.executeOnFiles(["non-exist/**/*.js"]);
                }, "No files matching 'non-exist/**/*.js' were found.");
            });

            it("two files", () => {
                assert.throws(() => {
                    engine.executeOnFiles(["aaa.js", "bbb.js"]);
                }, "No files matching 'aaa.js' were found.");
            });

            it("a mix of an existing file and a non-existing file", () => {
                assert.throws(() => {
                    engine.executeOnFiles(["console.js", "non-exist.js"]);
                }, "No files matching 'non-exist.js' were found.");
            });
        });

        describe("overrides", () => {
            beforeEach(() => {
                engine = new CLIEngine({
                    cwd: getFixturePath("cli-engine/overrides-with-dot"),
                    ignore: false
                });
            });

        });

        describe("configs of plugin rules should be validated even if 'plugins' key doesn't exist; https://github.com/ec0lint/ec0lint/issues/11559", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: path.join(os.tmpdir(), "cli-engine/11559"),
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
                    ".ec0lintrc.json": {

                        // Import via the recommended config.
                        extends: "plugin:test/recommended",

                        // Has invalid option.
                        rules: { "test/foo": ["error", "invalid-option"] }
                    },
                    "a.js": "console.log();"
                }
            });

            beforeEach(() => {
                engine = new CLIEngine({
                    cwd: getPath()
                });

                return prepare();
            });

            afterEach(cleanup);

            it("should throw fatal error.", () => {
                assert.throws(() => {
                    engine.executeOnFiles("a.js");
                }, /invalid-option/u);
            });
        });

        describe("MODULE_NOT_FOUND error handling", () => {
            const cwd = getFixturePath("module-not-found");

            beforeEach(() => {
                engine = new CLIEngine({ cwd });
            });

            it("should throw an error with a message template when 'extends' property has a non-existence JavaScript config.", () => {
                try {
                    engine.executeOnText("test", "extends-js/test.js");
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

            it("should throw an error with a message template when 'extends' property has a non-existence plugin config.", () => {
                try {
                    engine.executeOnText("test", "extends-plugin/test.js");
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

            it("should throw an error with a message template when 'plugins' property has a non-existence plugin.", () => {
                try {
                    engine.executeOnText("test", "plugins/test.js");
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

            it("should throw an error with no message template when a JavaScript config threw a 'MODULE_NOT_FOUND' error.", () => {
                try {
                    engine.executeOnText("test", "throw-in-config-itself/test.js");
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    assert.strictEqual(err.messageTemplate, void 0);
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with no message template when 'extends' property has a JavaScript config that throws a 'MODULE_NOT_FOUND' error.", () => {
                try {
                    engine.executeOnText("test", "throw-in-extends-js/test.js");
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    assert.strictEqual(err.messageTemplate, void 0);
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with no message template when 'extends' property has a plugin config that throws a 'MODULE_NOT_FOUND' error.", () => {
                try {
                    engine.executeOnText("test", "throw-in-extends-plugin/test.js");
                } catch (err) {
                    assert.strictEqual(err.code, "MODULE_NOT_FOUND");
                    // assert.strictEqual(err.messageTemplate, void 0);
                    return;
                }
                assert.fail("Expected to throw an error");
            });

            it("should throw an error with no message template when 'plugins' property has a plugin config that throws a 'MODULE_NOT_FOUND' error.", () => {
                try {
                    engine.executeOnText("test", "throw-in-plugins/test.js");
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


            it("should use the configured rules which are defined by '--rulesdir' option.", () => {

                engine = new CLIEngine({
                    cwd: getPath(),
                    rulePaths: ["internal-rules"]
                });
                const report = engine.executeOnFiles(["test.js"]);

                assert.strictEqual(report.results.length, 1);
                assert.strictEqual(report.results[0].messages.length, 1);
                assert.strictEqual(report.results[0].messages[0].message, "ok");
                assert.strictEqual(report.results[0].suppressedMessages.length, 0);
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

                engine = new CLIEngine({ cwd: teardown.getPath() });

                await teardown.prepare();
                cleanup = teardown.cleanup;

                const { results } = engine.executeOnFiles(["[ab].js"]);
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

                engine = new CLIEngine({ cwd: teardown.getPath() });

                await teardown.prepare();
                cleanup = teardown.cleanup;

                const { results } = engine.executeOnFiles(["[ab].js"]);
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
                engine = new CLIEngine({ cwd: teardown.getPath() });

                const { results } = engine.executeOnFiles(["test.js"]);
                const messages = results[0].messages;

                assert.strictEqual(messages.length, 1);
                assert.strictEqual(messages[0].message, "'/*globals*/' has no effect because you have 'noInlineConfig' setting in your config (.ec0lintrc.yml).");
                assert.strictEqual(results[0].suppressedMessages.length, 0);
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
                engine = new CLIEngine({ cwd: teardown.getPath() });

                const { results } = engine.executeOnFiles(["test.js"]);
                const messages = results[0].messages;

                assert.strictEqual(messages.length, 1);
                assert.strictEqual(messages[0].message, "'/*globals*/' has no effect because you have 'noInlineConfig' setting in your config (.ec0lintrc.yml » ec0lint-config-foo).");
                assert.strictEqual(results[0].suppressedMessages.length, 0);
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
                engine = new CLIEngine({ cwd: teardown.getPath() });

                const { results } = engine.executeOnFiles(["test.js"]);
                const messages = results[0].messages;

                assert.strictEqual(messages.length, 1);
                assert.strictEqual(messages[0].severity, 1);
                assert.strictEqual(messages[0].message, "Unused ec0lint-disable directive (no problems were reported from 'lighter-http').");
                assert.strictEqual(results[0].suppressedMessages.length, 0);
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

                    engine = new CLIEngine({
                        cwd: teardown.getPath(),
                        reportUnusedDisableDirectives: "off"
                    });

                    const { results } = engine.executeOnFiles(["test.js"]);
                    const messages = results[0].messages;

                    assert.strictEqual(messages.length, 0);
                    assert.strictEqual(results[0].suppressedMessages.length, 0);
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

                    engine = new CLIEngine({
                        cwd: teardown.getPath(),
                        reportUnusedDisableDirectives: "error"
                    });

                    const { results } = engine.executeOnFiles(["test.js"]);
                    const messages = results[0].messages;

                    assert.strictEqual(messages.length, 1);
                    assert.strictEqual(messages[0].severity, 2);
                    assert.strictEqual(messages[0].message, "Unused ec0lint-disable directive (no problems were reported from 'lighter-http').");
                    assert.strictEqual(results[0].suppressedMessages.length, 0);
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

            it("'executeOnFiles(\".\")' should not load config files from outside of \".\".", async () => {
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
                engine = new CLIEngine({ cwd: teardown.getPath() });

                // Don't throw "failed to load config file" error.
                engine.executeOnFiles(".");
            });

            it("'executeOnFiles(\".\")' should not ignore '.' even if 'ignorePatterns' contains it.", async () => {
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
                engine = new CLIEngine({ cwd: teardown.getPath() });


                // Don't throw "file not found" error.
                engine.executeOnFiles(".");
            });

            it("'executeOnFiles(\"subdir\")' should not ignore './subdir' even if 'ignorePatterns' contains it.", async () => {
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
                engine = new CLIEngine({ cwd: teardown.getPath() });

                // Don't throw "file not found" error.
                engine.executeOnFiles("subdir");
            });
        });
    });

    describe("getConfigForFile", () => {

        it("should return the config when run from within a subdir", () => {
            const options = {
                cwd: getFixturePath("config-hierarchy", "root-true", "parent", "root", "subdir")
            };
            const engine = new CLIEngine(options);
            const filePath = getFixturePath("config-hierarchy", "root-true", "parent", "root", ".ec0lintrc");

            const actualConfig = engine.getConfigForFile("./.ec0lintrc");
            const expectedConfig = new CascadingConfigArrayFactory(options)
                .getConfigArrayForFile(filePath)
                .extractConfig(filePath)
                .toCompatibleObjectAsConfigFileContent();

            assert.deepStrictEqual(actualConfig, expectedConfig);
        });

        it("should throw an error if a directory path was given.", () => {
            const engine = new CLIEngine();

            try {
                engine.getConfigForFile(".");
            } catch (error) {
                assert.strictEqual(error.messageTemplate, "print-config-with-directory-path");
                return;
            }
            assert.fail("should throw an error");
        });
    });

    describe("isPathIgnored", () => {
        it("should check if the given path is ignored", () => {
            const engine = new CLIEngine({
                ignorePath: getFixturePath(".ec0lintignore2"),
                cwd: getFixturePath()
            });

            assert.isTrue(engine.isPathIgnored("undef.js"));
            assert.isFalse(engine.isPathIgnored("passing.js"));
        });

        it("should return false if ignoring is disabled", () => {
            const engine = new CLIEngine({
                ignore: false,
                ignorePath: getFixturePath(".ec0lintignore2"),
                cwd: getFixturePath()
            });

            assert.isFalse(engine.isPathIgnored("undef.js"));
        });

        it("should return true for default ignores even if ignoring is disabled", () => {
            const engine = new CLIEngine({
                ignore: false,
                cwd: getFixturePath("cli-engine")
            });

            assert.isTrue(engine.isPathIgnored("node_modules/foo.js"));
        });

        describe("about the default ignore patterns", () => {
            it("should always apply defaultPatterns if ignore option is true", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules/package/file.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/node_modules/package/file.js")));
            });

            it("should still apply defaultPatterns if ignore option is is false", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignore: false, cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules/package/file.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/node_modules/package/file.js")));
            });

            it("should allow subfolders of defaultPatterns to be unignored by ignorePattern", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ cwd, ignorePattern: "!/node_modules/package" });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules", "package", "file.js")));
            });

            it("should allow subfolders of defaultPatterns to be unignored by ignorePath", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ cwd, ignorePath: getFixturePath("ignored-paths", ".ec0lintignoreWithUnignoredDefaults") });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules", "package", "file.js")));
            });

            it("should ignore dotfiles", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", ".foo")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo/.bar")));
            });

            it("should ignore directories beginning with a dot", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", ".foo/bar")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo/.bar/baz")));
            });

            it("should still ignore dotfiles when ignore option disabled", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignore: false, cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", ".foo")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo/.bar")));
            });

            it("should still ignore directories beginning with a dot when ignore option disabled", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignore: false, cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", ".foo/bar")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo/.bar/baz")));
            });

            it("should not ignore absolute paths containing '..'", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ cwd });

                assert(!engine.isPathIgnored(`${getFixturePath("ignored-paths", "foo")}/../unignored.js`));
            });

            it("should ignore /node_modules/ relative to .ec0lintignore when loaded", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignorePath: getFixturePath("ignored-paths", ".ec0lintignore"), cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules", "existing.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo", "node_modules", "existing.js")));
            });

            it("should ignore /node_modules/ relative to cwd without an .ec0lintignore", () => {
                const cwd = getFixturePath("ignored-paths", "no-ignore-file");
                const engine = new CLIEngine({ cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "no-ignore-file", "node_modules", "existing.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "no-ignore-file", "foo", "node_modules", "existing.js")));
            });
        });

        describe("with no .ec0lintignore file", () => {
            it("should not travel to parent directories to find .ec0lintignore when it's missing and cwd is provided", () => {
                const cwd = getFixturePath("ignored-paths", "configurations");
                const engine = new CLIEngine({ cwd });

                // a .ec0lintignore in parent directories includes `*.js`, but don't load it.
                assert(!engine.isPathIgnored("foo.js"));
                assert(engine.isPathIgnored("node_modules/foo.js"));
            });

            it("should return false for files outside of the cwd (with no ignore file provided)", () => {

                // Default ignore patterns should not inadvertently ignore files in parent directories
                const engine = new CLIEngine({ cwd: getFixturePath("ignored-paths", "no-ignore-file") });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });
        });

        describe("with .ec0lintignore file or package.json file", () => {
            it("should load .ec0lintignore from cwd when explicitly passed", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ cwd });

                // `${cwd}/.ec0lintignore` includes `sampleignorepattern`.
                assert(engine.isPathIgnored("sampleignorepattern"));
            });

            it("should use package.json's ec0lintIgnore files if no specified .ec0lintignore file", () => {
                const cwd = getFixturePath("ignored-paths", "package-json-ignore");
                const engine = new CLIEngine({ cwd });

                assert(engine.isPathIgnored("hello.js"));
                assert(engine.isPathIgnored("world.js"));
            });

            it("should use correct message template if failed to parse package.json", () => {
                const cwd = getFixturePath("ignored-paths", "broken-package-json");

                assert.throw(() => {
                    try {
                        new CLIEngine({ cwd });
                    } catch (error) {
                        assert.strictEqual(error.messageTemplate, "failed-to-read-json");
                        throw error;
                    }
                });
            });

            it("should not use package.json's ec0lintIgnore files if specified .ec0lintignore file", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ cwd });

                /*
                 * package.json includes `hello.js` and `world.js`.
                 * .ec0lintignore includes `sampleignorepattern`.
                 */
                assert(!engine.isPathIgnored("hello.js"));
                assert(!engine.isPathIgnored("world.js"));
                assert(engine.isPathIgnored("sampleignorepattern"));
            });

            it("should error if package.json's ec0lintIgnore is not an array of file paths", () => {
                const cwd = getFixturePath("ignored-paths", "bad-package-json-ignore");

                assert.throws(() => {
                    new CLIEngine({ cwd });
                }, "Package.json ec0lintIgnore property requires an array of paths");
            });
        });

        describe("with --ignore-pattern option", () => {
            it("should accept a string for options.ignorePattern", () => {
                const cwd = getFixturePath("ignored-paths", "ignore-pattern");
                const engine = new CLIEngine({
                    ignorePattern: "ignore-me.txt",
                    cwd
                });

                assert(engine.isPathIgnored("ignore-me.txt"));
            });

            it("should accept an array for options.ignorePattern", () => {
                const engine = new CLIEngine({
                    ignorePattern: ["a", "b"],
                    useEc0lintrc: false
                });

                assert(engine.isPathIgnored("a"));
                assert(engine.isPathIgnored("b"));
                assert(!engine.isPathIgnored("c"));
            });

            it("should return true for files which match an ignorePattern even if they do not exist on the filesystem", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({
                    ignorePattern: "not-a-file",
                    cwd
                });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "not-a-file")));
            });

            it("should return true for file matching an ignore pattern exactly", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignorePattern: "undef.js", cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });

            it("should return false for file matching an invalid ignore pattern with leading './'", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignorePattern: "./undef.js", cwd });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });

            it("should return false for file in subfolder of cwd matching an ignore pattern with leading '/'", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignorePattern: "/undef.js", cwd });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "subdir", "undef.js")));
            });

            it("should return true for file matching a child of an ignore pattern", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignorePattern: "ignore-pattern", cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "ignore-pattern", "ignore-me.txt")));
            });

            it("should return true for file matching a grandchild of an ignore pattern", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignorePattern: "ignore-pattern", cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "ignore-pattern", "subdir", "ignore-me.txt")));
            });

            it("should return false for file not matching any ignore pattern", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignorePattern: "failing.js", cwd });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "unignored.js")));
            });

            it("two globstar '**' ignore pattern should ignore files in nested directories", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({ ignorePattern: "**/*.js", cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo/bar.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo/bar/baz.js")));
                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "foo.j2")));
                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "foo/bar.j2")));
                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "foo/bar/baz.j2")));
            });
        });

        describe("with --ignore-path option", () => {
            it("should load empty array with ignorePath set to false", () => {
                const cwd = getFixturePath("ignored-paths", "no-ignore-file");
                const engine = new CLIEngine({ ignorePath: false, cwd });

                // a .ec0lintignore in parent directories includes `*.js`, but don't load it.
                assert(!engine.isPathIgnored("foo.js"));
                assert(engine.isPathIgnored("node_modules/foo.js"));
            });

            it("initialization with ignorePath should work when cwd is a parent directory", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "custom-name", "ignore-file");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored("custom-name/foo.js"));
            });

            it("initialization with ignorePath should work when the file is in the cwd", () => {
                const cwd = getFixturePath("ignored-paths", "custom-name");
                const ignorePath = getFixturePath("ignored-paths", "custom-name", "ignore-file");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored("foo.js"));
            });

            it("initialization with ignorePath should work when cwd is a subdirectory", () => {
                const cwd = getFixturePath("ignored-paths", "custom-name", "subdirectory");
                const ignorePath = getFixturePath("ignored-paths", "custom-name", "ignore-file");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored("../custom-name/foo.js"));
            });

            it("initialization with invalid file should throw error", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "not-a-directory", ".foobaz");

                assert.throws(() => {
                    new CLIEngine({ ignorePath, cwd });
                }, "Cannot read .ec0lintignore file");
            });

            it("should return false for files outside of ignorePath's directory", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "custom-name", "ignore-file");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });

            it("should resolve relative paths from CWD", () => {
                const cwd = getFixturePath("ignored-paths", "subdir");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreForDifferentCwd");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/undef.js")));
                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
            });

            it("should resolve relative paths from CWD when it's in a child directory", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "subdir/.ec0lintignoreInChildDir");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/undef.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "undef.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "foo.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "subdir/foo.js")));

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "node_modules/bar.js")));
            });

            it("should resolve relative paths from CWD when it contains negated globs", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "subdir/.ec0lintignoreInChildDir");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored("subdir/blah.txt"));
                assert(engine.isPathIgnored("blah.txt"));
                assert(engine.isPathIgnored("subdir/bar.txt"));
                assert(!engine.isPathIgnored("bar.txt"));
                assert(!engine.isPathIgnored("subdir/baz.txt"));
                assert(!engine.isPathIgnored("baz.txt"));
            });

            it("should resolve default ignore patterns from the CWD even when the ignorePath is in a subdirectory", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "subdir/.ec0lintignoreInChildDir");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored("node_modules/blah.js"));
            });

            it("should resolve default ignore patterns from the CWD even when the ignorePath is in a parent directory", () => {
                const cwd = getFixturePath("ignored-paths", "subdir");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreForDifferentCwd");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored("node_modules/blah.js"));
            });

            it("should handle .ec0lintignore which contains CRLF correctly.", () => {
                const ignoreFileContent = fs.readFileSync(getFixturePath("ignored-paths", "crlf/.ec0lintignore"), "utf8");

                assert(ignoreFileContent.includes("\r"), "crlf/.ec0lintignore should contains CR.");

                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", "crlf/.ec0lintignore");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "crlf/hide1/a.js")));
                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "crlf/hide2/a.js")));
                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "crlf/hide3/a.js")));
            });

            it("should not include comments in ignore rules", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreWithComments");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(!engine.isPathIgnored("# should be ignored"));
                assert(engine.isPathIgnored("this_one_not"));
            });

            it("should ignore a non-negated pattern", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreWithNegation");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(engine.isPathIgnored(getFixturePath("ignored-paths", "negation", "ignore.js")));
            });

            it("should not ignore a negated pattern", () => {
                const cwd = getFixturePath("ignored-paths");
                const ignorePath = getFixturePath("ignored-paths", ".ec0lintignoreWithNegation");
                const engine = new CLIEngine({ ignorePath, cwd });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "negation", "unignore.js")));
            });
        });

        describe("with --ignore-path option and --ignore-pattern option", () => {
            it("should return false for ignored file when unignored with ignore pattern", () => {
                const cwd = getFixturePath("ignored-paths");
                const engine = new CLIEngine({
                    ignorePath: getFixturePath("ignored-paths", ".ec0lintignore"),
                    ignorePattern: "!sampleignorepattern",
                    cwd
                });

                assert(!engine.isPathIgnored(getFixturePath("ignored-paths", "sampleignorepattern")));
            });
        });
    });

    describe("getFormatter()", () => {

        it("should return a function when a bundled formatter is requested", () => {
            const engine = new CLIEngine(),
                formatter = engine.getFormatter("compact");

            assert.isFunction(formatter);
        });

        it("should return a function when no argument is passed", () => {
            const engine = new CLIEngine(),
                formatter = engine.getFormatter();

            assert.isFunction(formatter);
        });

        it("should return a function when a custom formatter is requested", () => {
            const engine = new CLIEngine(),
                formatter = engine.getFormatter(getFixturePath("formatters", "simple.js"));

            assert.isFunction(formatter);
        });

        it("should return a function when a custom formatter is requested, also if the path has backslashes", () => {
            const engine = new CLIEngine({
                cwd: path.join(fixtureDir, "..")
            }),
                formatter = engine.getFormatter(".\\fixtures\\formatters\\simple.js");

            assert.isFunction(formatter);
        });

        it("should return a function when a formatter prefixed with ec0lint-formatter is requested", () => {
            const engine = new CLIEngine({
                cwd: getFixturePath("cli-engine")
            }),
                formatter = engine.getFormatter("bar");

            assert.isFunction(formatter);
        });

        it("should return a function when a formatter is requested, also when the ec0lint-formatter prefix is included in the format argument", () => {
            const engine = new CLIEngine({
                cwd: getFixturePath("cli-engine")
            }),
                formatter = engine.getFormatter("ec0lint-formatter-bar");

            assert.isFunction(formatter);
        });

        it("should return a function when a formatter is requested within a scoped npm package", () => {
            const engine = new CLIEngine({
                cwd: getFixturePath("cli-engine")
            }),
                formatter = engine.getFormatter("@somenamespace/foo");

            assert.isFunction(formatter);
        });

        it("should return a function when a formatter is requested within a scoped npm package, also when the ec0lint-formatter prefix is included in the format argument", () => {
            const engine = new CLIEngine({
                cwd: getFixturePath("cli-engine")
            }),
                formatter = engine.getFormatter("@somenamespace/ec0lint-formatter-foo");

            assert.isFunction(formatter);
        });

        it("should return null when a custom formatter doesn't exist", () => {
            const engine = new CLIEngine(),
                formatterPath = getFixturePath("formatters", "doesntexist.js"),
                fullFormatterPath = path.resolve(formatterPath);

            assert.throws(() => {
                engine.getFormatter(formatterPath);
            }, `There was a problem loading formatter: ${fullFormatterPath}\nError: Cannot find module '${fullFormatterPath}'`);
        });

        it("should return null when a built-in formatter doesn't exist", () => {
            const engine = new CLIEngine();
            const fullFormatterPath = path.resolve(__dirname, "../../../lib/cli-engine/formatters/special");

            assert.throws(() => {
                engine.getFormatter("special");
            }, `There was a problem loading formatter: ${fullFormatterPath}\nError: Cannot find module '${fullFormatterPath}'`);
        });

        it("should throw when a built-in formatter no longer exists", () => {
            const engine = new CLIEngine();

            assert.throws(() => {
                engine.getFormatter("table");
            }, "The table formatter is no longer part of core ec0lint. Install it manually with `npm install -D ec0lint-formatter-table`");

            assert.throws(() => {
                engine.getFormatter("codeframe");
            }, "The codeframe formatter is no longer part of core ec0lint. Install it manually with `npm install -D ec0lint-formatter-codeframe`");
        });

        it("should throw if the required formatter exists but has an error", () => {
            const engine = new CLIEngine(),
                formatterPath = getFixturePath("formatters", "broken.js");

            assert.throws(() => {
                engine.getFormatter(formatterPath);
            }, `There was a problem loading formatter: ${formatterPath}\nError: Cannot find module 'this-module-does-not-exist'`);
        });

        it("should return null when a non-string formatter name is passed", () => {
            const engine = new CLIEngine(),
                formatter = engine.getFormatter(5);

            assert.isNull(formatter);
        });

        it("should return a function when called as a static function on CLIEngine", () => {
            const formatter = CLIEngine.getFormatter();

            assert.isFunction(formatter);
        });

        it("should return a function when called as a static function on CLIEngine and a custom formatter is requested", () => {
            const formatter = CLIEngine.getFormatter(getFixturePath("formatters", "simple.js"));

            assert.isFunction(formatter);
        });

    });

    describe("getErrorResults()", () => {

        it("should return 0 error or warning messages even when the file has warnings", () => {
            const engine = new CLIEngine({
                ignorePath: path.join(fixtureDir, ".ec0lintignore"),
                cwd: path.join(fixtureDir, "..")
            });

            const report = engine.executeOnText("var bar = foo;", "fixtures/passing.js", true);
            const errorReport = CLIEngine.getErrorResults(report.results);

            assert.lengthOf(errorReport, 0);
            assert.lengthOf(report.results, 1);
            assert.strictEqual(report.errorCount, 0);
            assert.strictEqual(report.warningCount, 1);
            assert.strictEqual(report.fatalErrorCount, 0);
            assert.strictEqual(report.fixableErrorCount, 0);
            assert.strictEqual(report.fixableWarningCount, 0);
            assert.strictEqual(report.results[0].errorCount, 0);
            assert.strictEqual(report.results[0].warningCount, 1);
            assert.strictEqual(report.results[0].fatalErrorCount, 0);
            assert.strictEqual(report.results[0].fixableErrorCount, 0);
            assert.strictEqual(report.results[0].fixableWarningCount, 0);
        });
    });

    describe("outputFixes()", () => {
        afterEach(() => {
            sinon.verifyAndRestore();
        });

        it("should call fs.writeFileSync() for each result with output", () => {
            const fakeFS = {
                writeFileSync: () => { }
            },
                localCLIEngine = proxyquire("../../../lib/cli-engine/cli-engine", {
                    fs: fakeFS
                }).CLIEngine,
                report = {
                    results: [
                        {
                            filePath: "foo.js",
                            output: "bar"
                        },
                        {
                            filePath: "bar.js",
                            output: "baz"
                        }
                    ]
                };

            const spy = sinon.spy(fakeFS, "writeFileSync");

            localCLIEngine.outputFixes(report);

            assert.strictEqual(spy.callCount, 2);
            assert.isTrue(spy.firstCall.calledWithExactly("foo.js", "bar"), "First call was incorrect.");
            assert.isTrue(spy.secondCall.calledWithExactly("bar.js", "baz"), "Second call was incorrect.");

        });

        it("should call fs.writeFileSync() for each result with output and not at all for a result without output", () => {
            const fakeFS = {
                writeFileSync: () => { }
            },
                localCLIEngine = proxyquire("../../../lib/cli-engine/cli-engine", {
                    fs: fakeFS
                }).CLIEngine,
                report = {
                    results: [
                        {
                            filePath: "foo.js",
                            output: "bar"
                        },
                        {
                            filePath: "abc.js"
                        },
                        {
                            filePath: "bar.js",
                            output: "baz"
                        }
                    ]
                };

            const spy = sinon.spy(fakeFS, "writeFileSync");

            localCLIEngine.outputFixes(report);

            assert.strictEqual(spy.callCount, 2);
            assert.isTrue(spy.firstCall.calledWithExactly("foo.js", "bar"), "First call was incorrect.");
            assert.isTrue(spy.secondCall.calledWithExactly("bar.js", "baz"), "Second call was incorrect.");

        });

    });

    describe("getRules()", () => {
        it("should expose the list of rules", () => {
            const engine = new CLIEngine();

            assert(engine.getRules().has("lighter-http"), "lighter-http is present");
        });
    });

    describe("resolveFileGlobPatterns", () => {

        [
            [".", ["**/*.{js}"]],
            ["./", ["**/*.{js}"]],
            ["../", ["../**/*.{js}"]],
            ["", []]
        ].forEach(([input, expected]) => {

            it(`should correctly resolve ${input} to ${expected}`, () => {
                const engine = new CLIEngine();

                const result = engine.resolveFileGlobPatterns([input]);

                assert.deepStrictEqual(result, expected);

            });
        });

        it("should convert a directory name with no provided extensions into a glob pattern", () => {
            const patterns = ["one-js-file"];
            const opts = {
                cwd: getFixturePath("glob-util")
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["one-js-file/**/*.{js}"]);
        });

        it("should not convert path with globInputPaths option false", () => {
            const patterns = ["one-js-file"];
            const opts = {
                cwd: getFixturePath("glob-util"),
                globInputPaths: false
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["one-js-file"]);
        });

        it("should convert an absolute directory name with no provided extensions into a posix glob pattern", () => {
            const patterns = [getFixturePath("glob-util", "one-js-file")];
            const opts = {
                cwd: getFixturePath("glob-util")
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);
            const expected = [`${getFixturePath("glob-util", "one-js-file").replace(/\\/gu, "/")}/**/*.{js}`];

            assert.deepStrictEqual(result, expected);
        });

        it("should convert a directory name with a single provided extension into a glob pattern", () => {
            const patterns = ["one-js-file"];
            const opts = {
                cwd: getFixturePath("glob-util"),
                extensions: [".jsx"]
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["one-js-file/**/*.{jsx}"]);
        });

        it("should convert a directory name with multiple provided extensions into a glob pattern", () => {
            const patterns = ["one-js-file"];
            const opts = {
                cwd: getFixturePath("glob-util"),
                extensions: [".jsx", ".js"]
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["one-js-file/**/*.{jsx,js}"]);
        });

        it("should convert multiple directory names into glob patterns", () => {
            const patterns = ["one-js-file", "two-js-files"];
            const opts = {
                cwd: getFixturePath("glob-util")
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["one-js-file/**/*.{js}", "two-js-files/**/*.{js}"]);
        });

        it("should remove leading './' from glob patterns", () => {
            const patterns = ["./one-js-file"];
            const opts = {
                cwd: getFixturePath("glob-util")
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["one-js-file/**/*.{js}"]);
        });

        it("should convert a directory name with a trailing '/' into a glob pattern", () => {
            const patterns = ["one-js-file/"];
            const opts = {
                cwd: getFixturePath("glob-util")
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["one-js-file/**/*.{js}"]);
        });

        it("should return filenames as they are", () => {
            const patterns = ["some-file.js"];
            const opts = {
                cwd: getFixturePath("glob-util")
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["some-file.js"]);
        });

        it("should convert backslashes into forward slashes", () => {
            const patterns = ["one-js-file\\example.js"];
            const opts = {
                cwd: getFixturePath()
            };
            const result = new CLIEngine(opts).resolveFileGlobPatterns(patterns);

            assert.deepStrictEqual(result, ["one-js-file/example.js"]);
        });
    });

    describe("when evaluating code when reportUnusedDisableDirectives is enabled", () => {
        it("should report problems for unused ec0lint-disable directives", () => {
            const cliEngine = new CLIEngine({ useEc0lintrc: false, reportUnusedDisableDirectives: true });

            assert.deepStrictEqual(
                cliEngine.executeOnText("/* ec0lint-disable */"),
                {
                    results: [
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
                            source: "/* ec0lint-disable */"
                        }
                    ],
                    errorCount: 1,
                    warningCount: 0,
                    fatalErrorCount: 0,
                    fixableErrorCount: 1,
                    fixableWarningCount: 0,
                    usedDeprecatedRules: []
                }
            );
        });
    });

    describe("when retreiving version number", () => {
        it("should return current version number", () => {
            const ec0lintCLI = require("../../../lib/cli-engine").CLIEngine;
            const version = ec0lintCLI.version;

            assert.isString(version);
            assert.isTrue(parseInt(version[0], 10) >= 0);
        });
    });

    describe("mutability", () => {
        describe("plugins", () => {
            it("Loading plugin in one instance doesn't mutate to another instance", () => {
                const filePath = getFixturePath("single-quoted.js");
                const engine1 = cliEngineWithPlugins({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    plugins: ["example"],
                    rules: { "example/example-rule": 1 }
                });
                const engine2 = new CLIEngine({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false
                });
                const fileConfig1 = engine1.getConfigForFile(filePath);
                const fileConfig2 = engine2.getConfigForFile(filePath);

                // plugin
                assert.deepStrictEqual(fileConfig1.plugins, ["example"], "Plugin is present for engine 1");
                assert.deepStrictEqual(fileConfig2.plugins, [], "Plugin is not present for engine 2");
            });
        });

        describe("rules", () => {
            it("Loading rules in one instance doesn't mutate to another instance", () => {
                const filePath = getFixturePath("single-quoted.js");
                const engine1 = new CLIEngine({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false,
                    rules: { "example/example-rule": 1 }
                });
                const engine2 = new CLIEngine({
                    cwd: path.join(fixtureDir, ".."),
                    useEc0lintrc: false
                });
                const fileConfig1 = engine1.getConfigForFile(filePath);
                const fileConfig2 = engine2.getConfigForFile(filePath);

                // plugin
                assert.deepStrictEqual(fileConfig1.rules["example/example-rule"], [1], "example is present for engine 1");
                assert.isUndefined(fileConfig2.rules["example/example-rule"], "example is not present for engine 2");
            });
        });
    });

    // describe("with ignorePatterns config", () => {
    //     const root = getFixturePath("cli-engine/ignore-patterns");

    //     describe("ignorePatterns can add an ignore pattern ('foo.js').", () => {

    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": {
    //                     ignorePatterns: "foo.js"
    //                 },
    //                 "foo.js": "",
    //                 "bar.js": "",
    //                 "subdir/foo.js": "",
    //                 "subdir/bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //             assert.strictEqual(engine.isPathIgnored("subdir/foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("bar.js"), false);
    //             assert.strictEqual(engine.isPathIgnored("subdir/bar.js"), false);
    //         });

    //         it("'executeOnFiles()' should not verify 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "bar.js"),
    //                 path.join(root, "subdir/bar.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns can add ignore patterns ('foo.js', '/bar.js').", () => {
    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": {
    //                     ignorePatterns: ["foo.js", "/bar.js"]
    //                 },
    //                 "foo.js": "",
    //                 "bar.js": "",
    //                 "baz.js": "",
    //                 "subdir/foo.js": "",
    //                 "subdir/bar.js": "",
    //                 "subdir/baz.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //             assert.strictEqual(engine.isPathIgnored("subdir/foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'true' for '/bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("bar.js"), true);
    //             assert.strictEqual(engine.isPathIgnored("subdir/bar.js"), false);
    //         });

    //         it("'executeOnFiles()' should not verify 'foo.js' and '/bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "baz.js"),
    //                 path.join(root, "subdir/bar.js"),
    //                 path.join(root, "subdir/baz.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns can unignore '/node_modules/foo'.", () => {

    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": {
    //                     ignorePatterns: "!/node_modules/foo"
    //                 },
    //                 "node_modules/foo/index.js": "",
    //                 "node_modules/foo/.dot.js": "",
    //                 "node_modules/bar/index.js": "",
    //                 "foo.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'false' for 'node_modules/foo/index.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("node_modules/foo/index.js"), false);
    //         });

    //         it("'isPathIgnored()' should return 'true' for 'node_modules/foo/.dot.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("node_modules/foo/.dot.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'true' for 'node_modules/bar/index.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("node_modules/bar/index.js"), true);
    //         });

    //         it("'executeOnFiles()' should verify 'node_modules/foo/index.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "foo.js"),
    //                 path.join(root, "node_modules/foo/index.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns can unignore '.ec0lintrc.js'.", () => {

    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.js": `module.exports = ${JSON.stringify({
    //                     ignorePatterns: "!.ec0lintrc.js"
    //                 })}`,
    //                 "foo.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'false' for '.ec0lintrc.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored(".ec0lintrc.js"), false);
    //         });

    //         it("'executeOnFiles()' should verify '.ec0lintrc.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, ".ec0lintrc.js"),
    //                 path.join(root, "foo.js")
    //             ]);
    //         });
    //     });

    //     describe(".ec0lintignore can re-ignore files that are unignored by ignorePatterns.", () => {
    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.js": `module.exports = ${JSON.stringify({
    //                     ignorePatterns: "!.*"
    //                 })}`,
    //                 ".ec0lintignore": ".foo*",
    //                 ".foo.js": "",
    //                 ".bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for re-ignored '.foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored(".foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for unignored '.bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored(".bar.js"), false);
    //         });

    //         it("'executeOnFiles()' should not verify re-ignored '.foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, ".bar.js"),
    //                 path.join(root, ".ec0lintrc.js")
    //             ]);
    //         });
    //     });

    //     describe(".ec0lintignore can unignore files that are ignored by ignorePatterns.", () => {

    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.js": `module.exports = ${JSON.stringify({
    //                     ignorePatterns: "*.js"
    //                 })}`,
    //                 ".ec0lintignore": "!foo.js",
    //                 "foo.js": "",
    //                 "bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'false' for unignored 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), false);
    //         });

    //         it("'isPathIgnored()' should return 'true' for ignored 'bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("bar.js"), true);
    //         });

    //         it("'executeOnFiles()' should verify unignored 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "foo.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns in the config file in a child directory affects to only in the directory.", () => {
    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": JSON.stringify({
    //                     ignorePatterns: "foo.js"
    //                 }),
    //                 "subdir/.ec0lintrc.json": JSON.stringify({
    //                     ignorePatterns: "bar.js"
    //                 }),
    //                 "foo.js": "",
    //                 "bar.js": "",
    //                 "subdir/foo.js": "",
    //                 "subdir/bar.js": "",
    //                 "subdir/subsubdir/foo.js": "",
    //                 "subdir/subsubdir/bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //             assert.strictEqual(engine.isPathIgnored("subdir/foo.js"), true);
    //             assert.strictEqual(engine.isPathIgnored("subdir/subsubdir/foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'true' for 'bar.js' in 'subdir'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("subdir/bar.js"), true);
    //             assert.strictEqual(engine.isPathIgnored("subdir/subsubdir/bar.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'bar.js' in the outside of 'subdir'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("bar.js"), false);
    //         });

    //         it("'executeOnFiles()' should verify 'bar.js' in the outside of 'subdir'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "bar.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns in the config file in a child directory can unignore the ignored files in the parent directory's config.", () => {
    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": JSON.stringify({
    //                     ignorePatterns: "foo.js"
    //                 }),
    //                 "subdir/.ec0lintrc.json": JSON.stringify({
    //                     ignorePatterns: "!foo.js"
    //                 }),
    //                 "foo.js": "",
    //                 "subdir/foo.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for 'foo.js' in the root directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'foo.js' in the child directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("subdir/foo.js"), false);
    //         });

    //         it("'executeOnFiles()' should verify 'foo.js' in the child directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "subdir/foo.js")
    //             ]);
    //         });
    //     });

    //     describe(".ec0lintignore can unignore files that are ignored by ignorePatterns in the config file in the child directory.", () => {
    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": {},
    //                 "subdir/.ec0lintrc.json": {
    //                     ignorePatterns: "*.js"
    //                 },
    //                 ".ec0lintignore": "!foo.js",
    //                 "foo.js": "",
    //                 "subdir/foo.js": "",
    //                 "subdir/bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'false' for unignored 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), false);
    //             assert.strictEqual(engine.isPathIgnored("subdir/foo.js"), false);
    //         });

    //         it("'isPathIgnored()' should return 'true' for ignored 'bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("subdir/bar.js"), true);
    //         });

    //         it("'executeOnFiles()' should verify unignored 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "foo.js"),
    //                 path.join(root, "subdir/foo.js")
    //             ]);
    //         });
    //     });

    //     describe("if the config in a child directory has 'root:true', ignorePatterns in the config file in the parent directory should not be used.", () => {
    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": {
    //                     ignorePatterns: "foo.js"
    //                 },
    //                 "subdir/.ec0lintrc.json": {
    //                     root: true,
    //                     ignorePatterns: "bar.js"
    //                 },
    //                 "foo.js": "",
    //                 "bar.js": "",
    //                 "subdir/foo.js": "",
    //                 "subdir/bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for 'foo.js' in the root directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'bar.js' in the root directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("bar.js"), false);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'foo.js' in the child directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("subdir/foo.js"), false);
    //         });

    //         it("'isPathIgnored()' should return 'true' for 'bar.js' in the child directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("subdir/bar.js"), true);
    //         });

    //         it("'executeOnFiles()' should verify 'bar.js' in the root directory and 'foo.js' in the child directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "bar.js"),
    //                 path.join(root, "subdir/foo.js")
    //             ]);
    //         });
    //     });

    //     describe("even if the config in a child directory has 'root:true', .ec0lintignore should be used.", () => {

    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": JSON.stringify({}),
    //                 "subdir/.ec0lintrc.json": JSON.stringify({
    //                     root: true,
    //                     ignorePatterns: "bar.js"
    //                 }),
    //                 ".ec0lintignore": "foo.js",
    //                 "foo.js": "",
    //                 "bar.js": "",
    //                 "subdir/foo.js": "",
    //                 "subdir/bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //             assert.strictEqual(engine.isPathIgnored("subdir/foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'bar.js' in the root directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("bar.js"), false);
    //         });

    //         it("'isPathIgnored()' should return 'true' for 'bar.js' in the child directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("subdir/bar.js"), true);
    //         });

    //         it("'executeOnFiles()' should verify 'bar.js' in the root directory.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "bar.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns in the shareable config should be used.", () => {
    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 "node_modules/ec0lint-config-one/index.js": `module.exports = ${JSON.stringify({
    //                     ignorePatterns: "foo.js"
    //                 })}`,
    //                 ".ec0lintrc.json": JSON.stringify({
    //                     extends: "one"
    //                 }),
    //                 "foo.js": "",
    //                 "bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("bar.js"), false);
    //         });

    //         it("'executeOnFiles()' should verify 'bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "bar.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns in the shareable config should be relative to the entry config file.", () => {

    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 "node_modules/ec0lint-config-one/index.js": `module.exports = ${JSON.stringify({
    //                     ignorePatterns: "/foo.js"
    //                 })}`,
    //                 ".ec0lintrc.json": JSON.stringify({
    //                     extends: "one"
    //                 }),
    //                 "foo.js": "",
    //                 "subdir/foo.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);


    //         it("'isPathIgnored()' should return 'true' for 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'subdir/foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("subdir/foo.js"), false);
    //         });

    //         it("'executeOnFiles()' should verify 'subdir/foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "subdir/foo.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns in a config file can unignore the files which are ignored by ignorePatterns in the shareable config.", () => {

    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 "node_modules/ec0lint-config-one/index.js": `module.exports = ${JSON.stringify({
    //                     ignorePatterns: "*.js"
    //                 })}`,
    //                 ".ec0lintrc.json": JSON.stringify({
    //                     extends: "one",
    //                     ignorePatterns: "!bar.js"
    //                 }),
    //                 "foo.js": "",
    //                 "bar.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'true' for 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), true);
    //         });

    //         it("'isPathIgnored()' should return 'false' for 'bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });

    //             assert.strictEqual(engine.isPathIgnored("bar.js"), false);
    //         });

    //         it("'executeOnFiles()' should verify 'bar.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath() });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "bar.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns in a config file should not be used if --no-ignore option was given.", () => {
    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.json": JSON.stringify({
    //                     ignorePatterns: "*.js"
    //                 }),
    //                 "foo.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("'isPathIgnored()' should return 'false' for 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath(), ignore: false });

    //             assert.strictEqual(engine.isPathIgnored("foo.js"), false);
    //         });

    //         it("'executeOnFiles()' should verify 'foo.js'.", () => {
    //             const engine = new CLIEngine({ cwd: getPath(), ignore: false });
    //             const filePaths = engine.executeOnFiles("**/*.js")
    //                 .results
    //                 .map(r => r.filePath)
    //                 .sort();

    //             assert.deepStrictEqual(filePaths, [
    //                 path.join(root, "foo.js")
    //             ]);
    //         });
    //     });

    //     describe("ignorePatterns in overrides section is not allowed.", () => {

    //         const { prepare, cleanup, getPath } = createCustomTeardown({
    //             cwd: root,
    //             files: {
    //                 ".ec0lintrc.js": `module.exports = ${JSON.stringify({
    //                     overrides: [
    //                         {
    //                             files: "*.js",
    //                             ignorePatterns: "foo.js"
    //                         }
    //                     ]
    //                 })}`,
    //                 "foo.js": ""
    //             }
    //         });

    //         beforeEach(prepare);
    //         afterEach(cleanup);

    //         it("should throw a configuration error.", () => {
    //             assert.throws(() => {
    //                 const engine = new CLIEngine({ cwd: getPath() });

    //                 engine.executeOnFiles("*.js");
    //             }, "Unexpected top-level property \"overrides[0].ignorePatterns\"");
    //         });
    //     });

    // });

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

            it("'executeOnFiles()' with a directory path should contain 'foo/test.txt'.", () => {
                const engine = new CLIEngine({ cwd: getPath() });
                const filePaths = engine.executeOnFiles(".")
                    .results
                    .map(r => r.filePath)
                    .sort();

                assert.deepStrictEqual(filePaths, [
                    path.join(root, "bar/test.js"),
                    path.join(root, "foo/test.js"),
                    path.join(root, "foo/test.txt"),
                    path.join(root, "test.js")
                ]);
            });

            it("'executeOnFiles()' with a glob pattern '*.js' should not contain 'foo/test.txt'.", () => {
                const engine = new CLIEngine({ cwd: getPath() });
                const filePaths = engine.executeOnFiles("**/*.js")
                    .results
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

            it("'executeOnFiles()' with a directory path should contain 'foo/test.txt' and 'foo/nested/test.txt'.", () => {
                const engine = new CLIEngine({ cwd: getPath() });
                const filePaths = engine.executeOnFiles(".")
                    .results
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

            it("'executeOnFiles()' with a directory path should NOT contain 'foo/test.txt' and 'foo/nested/test.txt'.", () => {
                const engine = new CLIEngine({ cwd: getPath() });
                const filePaths = engine.executeOnFiles(".")
                    .results
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

            it("'executeOnFiles()' with a directory path should contain 'foo/test.txt' and 'foo/nested/test.txt'.", () => {
                const engine = new CLIEngine({ cwd: getPath() });
                const filePaths = engine.executeOnFiles(".")
                    .results
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

            it("'executeOnFiles()' with a directory path should contain 'foo/test.txt' and 'foo/nested/test.txt'.", () => {
                const engine = new CLIEngine({ cwd: getPath() });
                const filePaths = engine.executeOnFiles(".")
                    .results
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

    describe("plugin conflicts", () => {
        let uid = 0;
        const root = getFixturePath("cli-engine/plugin-conflicts-");

        /**
         * Verify thrown errors.
         * @param {() => void} f The function to run and throw.
         * @param {Record<string, any>} props The properties to verify.
         * @returns {void}
         */
        function assertThrows(f, props) {
            try {
                f();
            } catch (error) {
                for (const [key, value] of Object.entries(props)) {
                    assert.deepStrictEqual(error[key], value, key);
                }
                return;
            }

            assert.fail("Function should throw an error, but not.");
        }

        describe("between a config file and linear extendees.", () => {

            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/ec0lint-config-one/node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/ec0lint-config-one/index.js": `module.exports = ${JSON.stringify({
                        extends: ["two"],
                        plugins: ["foo"]
                    })}`,
                    "node_modules/ec0lint-config-two/node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/ec0lint-config-two/index.js": `module.exports = ${JSON.stringify({
                        plugins: ["foo"]
                    })}`,
                    ".ec0lintrc.json": JSON.stringify({
                        extends: ["one"],
                        plugins: ["foo"]
                    }),
                    "test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should NOT throw plugin-conflict error. (Load the plugin from the base directory of the entry config file.)", () => {
                const engine = new CLIEngine({ cwd: getPath() });

                engine.executeOnFiles("test.js");
            });
        });

        describe("between a config file and same-depth extendees.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/ec0lint-config-one/node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/ec0lint-config-one/index.js": `module.exports = ${JSON.stringify({
                        plugins: ["foo"]
                    })}`,
                    "node_modules/ec0lint-config-two/node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/ec0lint-config-two/index.js": `module.exports = ${JSON.stringify({
                        plugins: ["foo"]
                    })}`,
                    ".ec0lintrc.json": JSON.stringify({
                        extends: ["one", "two"],
                        plugins: ["foo"]
                    }),
                    "test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should NOT throw plugin-conflict error. (Load the plugin from the base directory of the entry config file.)", () => {
                const engine = new CLIEngine({ cwd: getPath() });

                engine.executeOnFiles("test.js");
            });
        });

        describe("between two config files in different directories, with single node_modules.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    ".ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "subdir/test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should NOT throw plugin-conflict error. (Load the plugin from the base directory of the entry config file, but there are two entry config files, but node_modules directory is unique.)", () => {
                const engine = new CLIEngine({ cwd: getPath() });

                engine.executeOnFiles("subdir/test.js");
            });
        });

        describe("between two config files in different directories, with multiple node_modules.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    ".ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "subdir/node_modules/ec0lint-plugin-foo/index.js": "",
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "subdir/test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should throw plugin-conflict error. (Load the plugin from the base directory of the entry config file, but there are two entry config files.)", () => {
                const engine = new CLIEngine({ cwd: getPath() });

                assertThrows(
                    () => engine.executeOnFiles("subdir/test.js"),
                    {
                        message: `Plugin "foo" was conflicted between "subdir${path.sep}.ec0lintrc.json" and ".ec0lintrc.json".`,
                        messageTemplate: "plugin-conflict",
                        messageData: {
                            pluginId: "foo",
                            plugins: [
                                {
                                    filePath: path.join(getPath(), "subdir/node_modules/ec0lint-plugin-foo/index.js"),
                                    importerName: `subdir${path.sep}.ec0lintrc.json`
                                },
                                {
                                    filePath: path.join(getPath(), "node_modules/ec0lint-plugin-foo/index.js"),
                                    importerName: ".ec0lintrc.json"
                                }
                            ]
                        }
                    }
                );
            });
        });

        describe("between '--config' option and a regular config file, with single node_modules.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/mine/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    ".ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should NOT throw plugin-conflict error. (Load the plugin from the base directory of the entry config file, but there are two entry config files, but node_modules directory is unique.)", () => {
                const engine = new CLIEngine({
                    cwd: getPath(),
                    configFile: "node_modules/mine/.ec0lintrc.json"
                });

                engine.executeOnFiles("test.js");
            });
        });

        describe("between '--config' option and a regular config file, with multiple node_modules.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/mine/node_modules/ec0lint-plugin-foo/index.js": "",
                    "node_modules/mine/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    ".ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should throw plugin-conflict error. (Load the plugin from the base directory of the entry config file, but there are two entry config files.)", () => {
                const engine = new CLIEngine({
                    cwd: getPath(),
                    configFile: "node_modules/mine/.ec0lintrc.json"
                });

                assertThrows(
                    () => engine.executeOnFiles("test.js"),
                    {
                        message: "Plugin \"foo\" was conflicted between \"--config\" and \".ec0lintrc.json\".",
                        messageTemplate: "plugin-conflict",
                        messageData: {
                            pluginId: "foo",
                            plugins: [
                                {
                                    filePath: path.join(getPath(), "node_modules/mine/node_modules/ec0lint-plugin-foo/index.js"),
                                    importerName: "--config"
                                },
                                {
                                    filePath: path.join(getPath(), "node_modules/ec0lint-plugin-foo/index.js"),
                                    importerName: ".ec0lintrc.json"
                                }
                            ]
                        }
                    }
                );
            });
        });

        describe("between '--plugin' option and a regular config file, with single node_modules.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "subdir/test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should NOT throw plugin-conflict error. (Load the plugin from both CWD and the base directory of the entry config file, but node_modules directory is unique.)", () => {
                const engine = new CLIEngine({
                    cwd: getPath(),
                    plugins: ["foo"]
                });

                engine.executeOnFiles("subdir/test.js");
            });
        });

        describe("between '--plugin' option and a regular config file, with multiple node_modules.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    "subdir/node_modules/ec0lint-plugin-foo/index.js": "",
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "subdir/test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should throw plugin-conflict error. (Load the plugin from both CWD and the base directory of the entry config file.)", () => {
                const engine = new CLIEngine({
                    cwd: getPath(),
                    plugins: ["foo"]
                });

                assertThrows(
                    () => engine.executeOnFiles("subdir/test.js"),
                    {
                        message: `Plugin "foo" was conflicted between "CLIOptions" and "subdir${path.sep}.ec0lintrc.json".`,
                        messageTemplate: "plugin-conflict",
                        messageData: {
                            pluginId: "foo",
                            plugins: [
                                {
                                    filePath: path.join(getPath(), "node_modules/ec0lint-plugin-foo/index.js"),
                                    importerName: "CLIOptions"
                                },
                                {
                                    filePath: path.join(getPath(), "subdir/node_modules/ec0lint-plugin-foo/index.js"),
                                    importerName: `subdir${path.sep}.ec0lintrc.json`
                                }
                            ]
                        }
                    }
                );
            });
        });

        describe("'--resolve-plugins-relative-to' option overrides the location that ec0lint load plugins from.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "node_modules/ec0lint-plugin-foo/index.js": "",
                    ".ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "subdir/node_modules/ec0lint-plugin-foo/index.js": "",
                    "subdir/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "subdir/test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should NOT throw plugin-conflict error. (Load the plugin from '--resolve-plugins-relative-to'.)", () => {
                const engine = new CLIEngine({
                    cwd: getPath(),
                    resolvePluginsRelativeTo: getPath()
                });

                engine.executeOnFiles("subdir/test.js");
            });
        });

        describe("between two config files with different target files.", () => {
            const { prepare, cleanup, getPath } = createCustomTeardown({
                cwd: `${root}${++uid}`,
                files: {
                    "one/node_modules/ec0lint-plugin-foo/index.js": "",
                    "one/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "one/test.js": "",
                    "two/node_modules/ec0lint-plugin-foo/index.js": "",
                    "two/.ec0lintrc.json": JSON.stringify({
                        plugins: ["foo"]
                    }),
                    "two/test.js": ""
                }
            });

            beforeEach(prepare);
            afterEach(cleanup);

            it("'executeOnFiles()' should NOT throw plugin-conflict error. (Load the plugin from the base directory of the entry config file for each target file. Not related to each other.)", () => {
                const engine = new CLIEngine({ cwd: getPath() });
                const { results } = engine.executeOnFiles("*/test.js");

                assert.strictEqual(results.length, 2);
            });
        });
    });
});
