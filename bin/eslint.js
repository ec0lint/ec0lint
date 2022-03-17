#!/usr/bin/env node

/**
 * @fileoverview Main CLI that is run via the eslint command.
 * @author Nicholas C. Zakas
 */

/* eslint no-console:off -- CLI */

"use strict";

// to use V8's code cache to speed up instantiation time
require("v8-compile-cache");

// must do this initialization *before* other requires in order to work
if (process.argv.includes("--debug")) {
    require("debug").enable("eslint:*,-eslint:code-path,eslintrc:*");
}

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * @returns {Promise<string>} The read text.
 */
function readStdin() {
    return new Promise((resolve, reject) => {
        let content = "";
        let chunk = "";

        process.stdin
            .setEncoding("utf8")
            .on("readable", () => {
                while ((chunk = process.stdin.read()) !== null) {
                    content += chunk;
                }
            })
            .on("end", () => resolve(content))
            .on("error", reject);
    });
}

/**
 * Get the error message of a given value.
 * @param {any} error The value to get.
 * @returns {string} The error message.
 */
function getErrorMessage(error) {

    // Lazy loading because this is used only if an error happened.
    const util = require("util");

    // Foolproof -- thirdparty module might throw non-object.
    if (typeof error !== "object" || error === null) {
        return String(error);
    }

    // Use templates if `error.messageTemplate` is present.
    if (typeof error.messageTemplate === "string") {
        try {
            const template = require(`../messages/${error.messageTemplate}.js`);

            return template(error.messageData || {});
        } catch {

            // Ignore template error then fallback to use `error.stack`.
        }
    }

    // Use the stacktrace if it's an error object.
    if (typeof error.stack === "string") {
        return error.stack;
    }

    // Otherwise, dump the object.
    return util.format("%o", error);
}

/**
 * Catch and report unexpected error.
 * @param {any} error The thrown error object.
 * @returns {void}
 */
function onFatalError(error) {
    process.exitCode = 2;

    const { version } = require("../package.json");
    const message = getErrorMessage(error);

    console.error(`
something went wrong! :(

ec0int: ${version}

${message}`);
}

//------------------------------------------------------------------------------
// Execution
//------------------------------------------------------------------------------

(async function main() {
    process.on("uncaughtException", onFatalError);
    process.on("unhandledRejection", onFatalError);

    // Call the config initializer if `--init` is present.
    if (process.argv.includes("--init")) {

        console.warn("You can also run this command directly using 'npm init @ec0lint/config'.");

        const spawn = require("cross-spawn");

        spawn.sync("npm", ["init", "@ec0lint/config"], { encoding: "utf8", stdio: "inherit" });
        return;
    }

    // Otherwise, call the CLI.
    process.exitCode = await require("../lib/cli").execute(
        process.argv,
        process.argv.includes("--stdin") ? await readStdin() : null
    );
}()).catch(onFatalError);
