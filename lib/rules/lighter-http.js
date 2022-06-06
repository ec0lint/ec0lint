/**
 * @fileoverview Rule to disallow importing axios
 * @author Julia Ziębińska
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const moduleVisitor = require("eslint-module-utils/moduleVisitor");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: "problem",

        docs: {
            description: "disallow importing axios",
            category: "Possible Errors",
            recommended: true,
            url: "https://eslint.org/docs/rules/lighter-http"
        },
        messages: {
            unexpected: "Do not import {{ name }}. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g"
        },
        schema: [] // no options,
    },
    create(context) {
        const options = {};
        const allowed = options.allow || [];
        const scopedRegExp = /^@[^/]+\/?[^/]+/u;

        /**
         * Returns if the given import is in scope
         * @param {string} name The name to consider
         * @returns {boolean} Returns true or false
         */
        function isScoped(name) {
            return name && scopedRegExp.test(name);
        }

        /**
         * Returns module name
         * @param {string} name Statement with name.
         * @returns {string} Returns module name
         */
        function baseModule(name) {

            if (isScoped(name)) {
                const [scope, pkg] = name.split("/");

                return `${scope}/${pkg}`;
            }
            const [pkg] = name.split("/");

            return pkg;
        }

        /**
         * Returns if the given module is different from 'fetch'
         * @param {string} name Module name
         * @returns {boolean} Returns true or false
         */
        function isHttpModule(name) {

            if (!name) {
                return false;
            }
            const base = baseModule(name);
            const result = ["axios", "got", "request", "make-fetch-happen", "superagent", "needle", "simple-get"].some(el => el === base);

            return result;
        }

        /**
         * Reports the given import
         * @param {Node} node Import node to check
         * @param {string} name Name of the import
         * @returns {void}
         */
        function reportIfMissing(node, name) {

            if (allowed.indexOf(name) === -1 && isHttpModule(name)) {
                context.report({ node, messageId: "unexpected", data: { name } });
            }
        }

        return moduleVisitor.default((source, node) => {
            reportIfMissing(node, source.value);
        }, { commonjs: true });
    }
};
