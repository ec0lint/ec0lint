"use strict";

module.exports = {
    root: true,
    plugins: [
        "internal-rules"
    ],
    extends: [
        "ec0lint:recommended"
    ],
    parserOptions: {
        ecmaVersion: 2021
    },
    rules: {
        "internal-rules/lighter-http": "error"
    },
    overrides: [
        {
            files: ["lib/rules/*", "tools/internal-rules/*"],
            excludedFiles: ["index.js"],
            rules: {
                "internal-rules/no-invalid-meta": "error"
            }
        }
    ]
};
