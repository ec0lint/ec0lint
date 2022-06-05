/**
 * @fileoverview Integration tests for the ec0lint.js executable.
 * @author Teddy Katz
 */

"use strict";

//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

const childProcess = require("child_process");
const fs = require("fs");
const assert = require("chai").assert;
const path = require("path");

//------------------------------------------------------------------------------
// Data
//------------------------------------------------------------------------------

const EXECUTABLE_PATH = path.resolve(path.join(__dirname, "../../bin/ec0lint.js"));

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Returns a Promise for when a child process exits
 * @param {ChildProcess} exitingProcess The child process
 * @returns {Promise<number>} A Promise that fulfills with the exit code when the child process exits
 */
function awaitExit(exitingProcess) {
    return new Promise(resolve => exitingProcess.once("exit", resolve));
}

/**
 * Asserts that the exit code of a given child process will equal the given value.
 * @param {ChildProcess} exitingProcess The child process
 * @param {number} expectedExitCode The expected exit code of the child process
 * @returns {Promise<void>} A Promise that fulfills if the exit code ends up matching, and rejects otherwise.
 */
function assertExitCode(exitingProcess, expectedExitCode) {
    return awaitExit(exitingProcess).then(exitCode => {
        assert.strictEqual(exitCode, expectedExitCode, `Expected an exit code of ${expectedExitCode} but got ${exitCode}.`);
    });
}

/**
 * Returns a Promise for the stdout of a process.
 * @param {ChildProcess} runningProcess The child process
 * @returns {Promise<{stdout: string, stderr: string}>} A Promise that fulfills with all of the
 * stdout and stderr output produced by the process when it exits.
 */
function getOutput(runningProcess) {
    let stdout = "";
    let stderr = "";

    runningProcess.stdout.on("data", data => (stdout += data));
    runningProcess.stderr.on("data", data => (stderr += data));
    return awaitExit(runningProcess).then(() => ({ stdout, stderr }));
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("bin/ec0lint.js", () => {
    const forkedProcesses = new Set();

    /**
     * Forks the process to run an instance of ESLint.
     * @param {string[]} [args] An array of arguments
     * @param {Object} [options] An object containing options for the resulting child process
     * @returns {ChildProcess} The resulting child process
     */
    function runESLint(args, options) {
        const newProcess = childProcess.fork(EXECUTABLE_PATH, args, Object.assign({ silent: true }, options));

        forkedProcesses.add(newProcess);
        return newProcess;
    }

    describe("running on files", () => {
        it("has exit code 0 if no linting errors occur", () => assertExitCode(runESLint(["bin/ec0lint.js", "--env", "es2021"]), 0));
        it("has exit code 0 if a linting warning is reported", () => assertExitCode(runESLint(["bin/ec0lint.js", "--env", "es2021", "--no-ec0lintrc"]), 0));
        it("has exit code 1 if a syntax error is thrown", () => assertExitCode(runESLint(["README.md"]), 1));
    });

    describe("cache files", () => {
        const CACHE_PATH = ".temp-ec0lintcache";
        const SOURCE_PATH = "tests/fixtures/cache/src/test-file.js";
        const ARGS_WITHOUT_CACHE = ["--no-ec0lintrc", "--no-ignore", SOURCE_PATH, "--cache-location", CACHE_PATH];
        const ARGS_WITH_CACHE = ARGS_WITHOUT_CACHE.concat("--cache");

        describe("when no cache file exists", () => {
            it("creates a cache file when the --cache flag is used", () => {
                const child = runESLint(ARGS_WITH_CACHE);

                return assertExitCode(child, 0).then(() => {
                    assert.isTrue(fs.existsSync(CACHE_PATH), "Cache file should exist at the given location");

                    // Cache file should contain valid JSON
                    JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
                });
            });
        });

        describe("when a valid cache file already exists", () => {
            beforeEach(() => {
                const child = runESLint(ARGS_WITH_CACHE);

                return assertExitCode(child, 0).then(() => {
                    assert.isTrue(fs.existsSync(CACHE_PATH), "Cache file should exist at the given location");
                });
            });
            it("can lint with an existing cache file and the --cache flag", () => {
                const child = runESLint(ARGS_WITH_CACHE);

                return assertExitCode(child, 0).then(() => {

                    // Note: This doesn't actually verify that the cache file is used for anything.
                    assert.isTrue(fs.existsSync(CACHE_PATH), "Cache file should still exist after linting with --cache");
                });
            });
            it("updates the cache file when the source file is modified", () => {
                const initialCacheContent = fs.readFileSync(CACHE_PATH, "utf8");

                // Update the file to change its mtime
                fs.writeFileSync(SOURCE_PATH, fs.readFileSync(SOURCE_PATH, "utf8"));

                const child = runESLint(ARGS_WITH_CACHE);

                return assertExitCode(child, 0).then(() => {
                    const newCacheContent = fs.readFileSync(CACHE_PATH, "utf8");

                    assert.notStrictEqual(initialCacheContent, newCacheContent, "Cache file should change after source is modified");
                });
            });
            it("deletes the cache file when run without the --cache argument", () => {
                const child = runESLint(ARGS_WITHOUT_CACHE);

                return assertExitCode(child, 0).then(() => {
                    assert.isFalse(fs.existsSync(CACHE_PATH), "Cache file should be deleted after running ESLint without the --cache argument");
                });
            });
        });

        // https://github.com/eslint/eslint/issues/7748
        describe("when an invalid cache file already exists", () => {
            beforeEach(() => {
                fs.writeFileSync(CACHE_PATH, "This is not valid JSON.");

                // Sanity check
                assert.throws(
                    () => JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")),
                    SyntaxError,
                    /Unexpected token/u,
                    "Cache file should not contain valid JSON at the start"
                );
            });

            it("overwrites the invalid cache file with a valid one when the --cache argument is used", () => {
                const child = runESLint(ARGS_WITH_CACHE);

                return assertExitCode(child, 0).then(() => {
                    assert.isTrue(fs.existsSync(CACHE_PATH), "Cache file should exist at the given location");

                    // Cache file should contain valid JSON
                    JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
                });
            });

            it("deletes the invalid cache file when the --cache argument is not used", () => {
                const child = runESLint(ARGS_WITHOUT_CACHE);

                return assertExitCode(child, 0).then(() => {
                    assert.isFalse(fs.existsSync(CACHE_PATH), "Cache file should be deleted after running ESLint without the --cache argument");
                });
            });
        });

        afterEach(() => {
            if (fs.existsSync(CACHE_PATH)) {
                fs.unlinkSync(CACHE_PATH);
            }
        });
    });

    afterEach(() => {

        // Clean up all the processes after every test.
        forkedProcesses.forEach(child => child.kill());
        forkedProcesses.clear();
    });
});
