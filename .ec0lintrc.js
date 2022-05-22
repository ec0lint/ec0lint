"use strict";

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
            files: ["tools/*.js"],
            rules: {
                "no-console": "off"
            }
        },
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
        }
    ]
};
