'use strict';

/**
 * @fileoverview Rule to avoid of using browser.
 * @author Anna Gut
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallows browser utility. Prefer `Navigator object from Window.navigator.`.',
            category: "Code improvements",
            recommended: false,
            url: "https://ecolint.org/docs/rules/no-browser"
        },
        messages: {
            suggestion: "Most of the jQuery methods can be replaced by plain JS code, for more go to https://youmightnotneedjquery.com/"
        },
        schema: []
    },

    create: function (context) {

        return {
            "Program:exit": function (node) {
                const scope = context.getScope();
                const line = scope.block.tokens.map((token) => token.value).join('')

                if (line.match(/\$\.browser|jQuery\.browser/)) {
                    context.report({
                        node: node,
                        message: 'browser property can be replaced Navigator object from Window.navigator',
                    });
                }
            }
        };
    }
}
