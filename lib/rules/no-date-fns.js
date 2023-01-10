/**
 * @fileoverview Rule to avoid of using lodash
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
        type: "suggestion",

        docs: {
            description: "disallow to stop importing date-fns",
            category: "Code improvements",
            recommended: false,
            url: "https://ec0lint.com/features/no-date-fns",
        },
        messages: {
            suggestion:
                "date-fns can be replaced with Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g",
        },
        schema: [], // no options,
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
         * Returns if the given module is different from 'loadash'
         * @param {string} name Module name
         * @returns {boolean} Returns true or false
         */
        function isDateFnsModule(name) {
            if (!name) {
                return false;
            }
            const base = baseModule(name);
            const result = base.match(/\b(date-fns)\b.?.*/u);

            return result;
        }

        /**
         * Reports the given import
         * @param {Node} node Import node to check
         * @param {string} name Name of the import
         * @returns {void}
         */
        function reportIfMissing(node, name) {
            if (allowed.indexOf(name) === -1 && isDateFnsModule(name)) {
                context.report({
                    node,
                    messageId: "suggestion",
                    data: { name },
                });
            }
        }

        return moduleVisitor.default(
            (source, node) => {
                reportIfMissing(node, source.value);
            },
            { commonjs: true }
        );
    },
};
