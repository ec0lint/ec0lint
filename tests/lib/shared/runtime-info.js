/**
 * @fileoverview Tests for RuntimeInfo util.
 * @author Kai Cataldo
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("chai").assert;
const sinon = require("sinon");
const spawn = require("cross-spawn");
const os = require("os");
const { unIndent } = require("../../_utils");
const RuntimeInfo = require("../../../lib/shared/runtime-info");
const log = require("../../../lib/shared/logging");
const packageJson = require("../../../package.json");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Sets up spawn.sync() stub calls to return values and throw errors in the order in which they are given.
 * @param {Function} stub The stub to set up.
 * @param {Array} returnVals Values to be returned by subsequent stub calls.
 * @returns {Function} The set up stub.
 */
function setupSpawnSyncStubReturnVals(stub, returnVals) {
    let stubChain = stub;

    for (const [i, val] of returnVals.entries()) {
        const returnVal = val instanceof Error
            ? { error: val }
            : { stdout: val };

        stubChain = stubChain.onCall(i).returns(returnVal);
    }

    return stubChain;
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const LOCAL_EC0LINT_BIN_PATH = "/Users/username/code/project/node_modules/ec0lint/bin/ec0lint.js";
const GLOBAL_EC0LINT_BIN_PATH = "/usr/local/bin/npm/node_modules/ec0lint/bin/ec0lint.js";
const NPM_BIN_PATH = "/usr/local/bin/npm";

describe("RuntimeInfo", () => {
    describe("environment()", () => {
        let spawnSyncStub;
        let logErrorStub;
        let originalProcessArgv;
        let spawnSyncStubArgs;
        const originalOsPlatform = os.platform;
        const originalOsRelease = os.release;

        beforeEach(() => {
            os.platform = () => "darwin";
            os.release = () => "20.3.0";
            spawnSyncStub = sinon.stub(spawn, "sync");
            logErrorStub = sinon.stub(log, "error");
            originalProcessArgv = process.argv;
            process.argv[1] = LOCAL_EC0LINT_BIN_PATH;
            spawnSyncStubArgs = [
                "v12.8.0",
                "6.11.3",
                unIndent`
                    {
                        "name": "project",
                        "version": "1.0.0",
                        "dependencies": {
                            "ec0lint": {
                                "version": "0.0.22"
                            }
                        }
                    }
                `,
                NPM_BIN_PATH,
                unIndent`
                    {
                        "dependencies": {
                            "ec0lint": {
                                "version": "0.0.22",
                                "from": "ec0lint",
                                "resolved": "https://registry.npmjs.org/ec0lint/-/ec0lint-0.0.22.tgz"
                            }
                        }
                    }
                `
            ];
        });

        afterEach(() => {
            spawnSyncStub.restore();
            logErrorStub.restore();
            process.argv = originalProcessArgv;
            os.platform = originalOsPlatform;
            os.release = originalOsRelease;
        });


        it("should return a string containing environment information when running local installation", () => {
            setupSpawnSyncStubReturnVals(spawnSyncStub, spawnSyncStubArgs);

            assert.strictEqual(
                RuntimeInfo.environment(),
                unIndent`
                    Environment Info:

                    Node version: v12.8.0
                    npm version: v6.11.3
                    Local ec0lint version: v0.0.22 (Currently used)
                    Global ec0lint version: v0.0.22
                    Operating System: darwin 20.3.0
                `
            );
        });

        it("should return a string containing environment information when running global installation", () => {
            setupSpawnSyncStubReturnVals(spawnSyncStub, spawnSyncStubArgs);
            process.argv[1] = GLOBAL_EC0LINT_BIN_PATH;

            assert.strictEqual(
                RuntimeInfo.environment(),
                unIndent`
                    Environment Info:

                    Node version: v12.8.0
                    npm version: v6.11.3
                    Local ec0lint version: v0.0.22
                    Global ec0lint version: v5.16.0 (Currently used)
                    Operating System: darwin 20.3.0
                `
            );
        });

        it("should return a string containing environment information when not installed locally", () => {
            spawnSyncStubArgs.splice(2, 2, unIndent`
                {
                    "name": "project",
                    "version": "1.0.0"
                }
            `);
            spawnSyncStubArgs.push(NPM_BIN_PATH);
            setupSpawnSyncStubReturnVals(spawnSyncStub, spawnSyncStubArgs);
            process.argv[1] = GLOBAL_EC0LINT_BIN_PATH;

            assert.strictEqual(
                RuntimeInfo.environment(),
                unIndent`
                    Environment Info:

                    Node version: v12.8.0
                    npm version: v6.11.3
                    Local ec0lint version: Not found
                    Global ec0lint version: v0.0.22 (Currently used)
                    Operating System: darwin 20.3.0
                `
            );
        });

        it("should return a string containing environment information when not installed globally", () => {
            spawnSyncStubArgs[4] = "{}";
            setupSpawnSyncStubReturnVals(spawnSyncStub, spawnSyncStubArgs);

            assert.strictEqual(
                RuntimeInfo.environment(),
                unIndent`
                    Environment Info:

                    Node version: v12.8.0
                    npm version: v6.11.3
                    Local ec0lint version: v0.0.22 (Currently used)
                    Global ec0lint version: Not found
                    Operating System: darwin 20.3.0
                `
            );
        });

        it("log and throw an error when npm version can not be found", () => {
            const expectedErr = new Error("npm can not be found");

            spawnSyncStubArgs[1] = expectedErr;
            setupSpawnSyncStubReturnVals(spawnSyncStub, spawnSyncStubArgs);

            assert.throws(RuntimeInfo.environment, expectedErr);
            assert.strictEqual(logErrorStub.args[0][0], "Error finding npm version running the command `npm --version`");
        });

        it("log and throw an error when npm binary path can not be found", () => {
            const expectedErr = new Error("npm can not be found");

            spawnSyncStubArgs[3] = expectedErr;
            setupSpawnSyncStubReturnVals(spawnSyncStub, spawnSyncStubArgs);

            assert.throws(RuntimeInfo.environment, expectedErr);
            assert.strictEqual(logErrorStub.args[0][0], "Error finding npm binary path when running command `npm bin -g`");
        });

        it("log and throw an error when checking for local ec0lint version when returned output of command is malformed", () => {
            spawnSyncStubArgs[2] = "This is not JSON";
            setupSpawnSyncStubReturnVals(spawnSyncStub, spawnSyncStubArgs);

            assert.throws(RuntimeInfo.environment, "Unexpected token T in JSON at position 0");
            assert.strictEqual(logErrorStub.args[0][0], "Error finding ec0lint version running the command `npm ls --depth=0 --json ec0lint`");
        });

        it("log and throw an error when checking for global ec0lint version when returned output of command is malformed", () => {
            spawnSyncStubArgs[4] = "This is not JSON";
            setupSpawnSyncStubReturnVals(spawnSyncStub, spawnSyncStubArgs);

            assert.throws(RuntimeInfo.environment, "Unexpected token T in JSON at position 0");
            assert.strictEqual(logErrorStub.args[0][0], "Error finding ec0lint version running the command `npm ls --depth=0 --json ec0lint -g`");
        });
    });

    describe("version()", () => {
        it("should return the version of the package defined in package.json", () => {
            assert.strictEqual(RuntimeInfo.version(), `v${packageJson.version}`);
        });
    });
});
