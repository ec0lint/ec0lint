"use strict";

const path = require("path");

const INTERNAL_FILES = {
    CLI_ENGINE_PATTERN: "lib/cli-engine/**/*",
    INIT_PATTERN: "lib/init/**/*",
    LINTER_PATTERN: "lib/linter/**/*",
    RULE_TESTER_PATTERN: "lib/rule-tester/**/*",
    RULES_PATTERN: "lib/rules/**/*",
    SOURCE_CODE_PATTERN: "lib/source-code/**/*"
};

/**
 * Resolve an absolute path or glob pattern.
 * @param {string} pathOrPattern the path or glob pattern.
 * @returns {string} The resolved path or glob pattern.
 */
function resolveAbsolutePath(pathOrPattern) {
    return path.resolve(__dirname, pathOrPattern);
}

/**
 * Create an array of `no-restricted-require` entries for ESLint's core files.
 * @param {string} [pattern] The glob pattern to create the entries for.
 * @returns {Object[]} The array of `no-restricted-require` entries.
 */
function createInternalFilesPatterns(pattern = null) {
    return Object.values(INTERNAL_FILES)
        .filter(p => p !== pattern)
        .map(p => ({
            name: [

                // Disallow all children modules.
                resolveAbsolutePath(p),

                // Allow the main `index.js` module.
                `!${resolveAbsolutePath(p.replace(/\*\*\/\*$/u, "index.js"))}`
            ]
        }));
}

module.exports = {
    root: true,
    plugins: [
        "ec0lint-plugin",
        "internal-rules"
    ],
    extends: [
        "ec0lint:recommended",
        "plugin:ec0lint-plugin/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2021
    },

    rules: {
        "ec0lint-plugin/prefer-message-ids": "error",
        "ec0lint-plugin/prefer-output-null": "error",
        "ec0lint-plugin/prefer-placeholders": "error",
        "ec0lint-plugin/prefer-replace-text": "error",
        "ec0lint-plugin/report-message-format": ["error", "[^a-z].*\\.$"],
        "ec0lint-plugin/require-meta-docs-description": "error",
        "ec0lint-plugin/test-case-property-ordering": "error",
        "ec0lint-plugin/test-case-shorthand-strings": "error",
        "internal-rules/multiline-comment-style": "error"
    },
    overrides: [
        {
            files: ["lib/rules/*", "tools/internal-rules/*"],
            excludedFiles: ["index.js"],
            rules: {
                "internal-rules/no-invalid-meta": "error"
            }
        },
        {
            files: ["lib/rules/*"],
            excludedFiles: ["index.js"],
            rules: {
                "ec0lint-plugin/require-meta-docs-url": ["error", { pattern: "https://eslint.org/docs/rules/{{name}}" }]
            }
        },
        {
            files: ["tests/**/*"],
            env: { mocha: true },
            rules: {
                "no-restricted-syntax": ["error", {
                    selector: "CallExpression[callee.object.name='assert'][callee.property.name='doesNotThrow']",
                    message: "`assert.doesNotThrow()` should be replaced with a comment next to the code."
                }]
            }
        },
        // Restrict relative path imports
        {
            files: ["lib/*"],
            excludedFiles: ["lib/unsupported-api.js"],
            rules: {
                "node/no-restricted-require": ["error", [
                    ...createInternalFilesPatterns()
                ]]
            }
        },
        {
            files: [INTERNAL_FILES.CLI_ENGINE_PATTERN],
            rules: {
                "node/no-restricted-require": ["error", [
                    ...createInternalFilesPatterns(INTERNAL_FILES.CLI_ENGINE_PATTERN)
                ]]
            }
        },
        {
            files: [INTERNAL_FILES.LINTER_PATTERN],
            rules: {
                "node/no-restricted-require": ["error", [
                    ...createInternalFilesPatterns(INTERNAL_FILES.LINTER_PATTERN),
                    "fs",
                    resolveAbsolutePath("lib/cli-engine/index.js"),
                    resolveAbsolutePath("lib/rule-tester/index.js")
                ]]
            }
        },
        {
            files: [INTERNAL_FILES.RULES_PATTERN],
            rules: {
                "node/no-restricted-require": ["error", [
                    ...createInternalFilesPatterns(INTERNAL_FILES.RULES_PATTERN),
                    "fs",
                    resolveAbsolutePath("lib/cli-engine/index.js"),
                    resolveAbsolutePath("lib/linter/index.js"),
                    resolveAbsolutePath("lib/rule-tester/index.js"),
                    resolveAbsolutePath("lib/source-code/index.js")
                ]]
            }
        },
        {
            files: ["lib/shared/**/*"],
            rules: {
                "node/no-restricted-require": ["error", [
                    ...createInternalFilesPatterns(),
                    resolveAbsolutePath("lib/cli-engine/index.js"),
                    resolveAbsolutePath("lib/linter/index.js"),
                    resolveAbsolutePath("lib/rule-tester/index.js"),
                    resolveAbsolutePath("lib/source-code/index.js")
                ]]
            }
        },
        {
            files: [INTERNAL_FILES.SOURCE_CODE_PATTERN],
            rules: {
                "node/no-restricted-require": ["error", [
                    ...createInternalFilesPatterns(INTERNAL_FILES.SOURCE_CODE_PATTERN),
                    "fs",
                    resolveAbsolutePath("lib/cli-engine/index.js"),
                    resolveAbsolutePath("lib/linter/index.js"),
                    resolveAbsolutePath("lib/rule-tester/index.js"),
                    resolveAbsolutePath("lib/rules/index.js")
                ]]
            }
        },
        {
            files: [INTERNAL_FILES.RULE_TESTER_PATTERN],
            rules: {
                "node/no-restricted-require": ["error", [
                    ...createInternalFilesPatterns(INTERNAL_FILES.RULE_TESTER_PATTERN),
                    resolveAbsolutePath("lib/cli-engine/index.js")
                ]]
            }
        }
    ]
};
