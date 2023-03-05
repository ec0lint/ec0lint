/**
 * @fileoverview Rule to disallow using boxModel
 * @author Julia Ziębińska
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
            description: 'Disallows of using property boxModel. Prefer `document.compatMode === “CSS1Compat”',
            category: "Code improvements",
            recommended: false,
            url: "https://ec0lint.com/features/no-box-model"
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

                const boxModelRegex = /[$][.]boxModel([.]style)?/gm

                if (line.match(boxModelRegex)) {
                    context.report({
                        node: node,
                        messageId: 'suggestion',
                    });
                }
            }
        };
    }
}