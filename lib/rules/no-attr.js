'use strict';

/**
 * @fileoverview Rule to avoid of using attr.
 * @author Julia Ziębińska
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const utils = require( './utils/utils.js' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports ={
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallows attr utilities: attr, removeAttr. Prefer `Element#getAttribute`/`setAttribute`/`removeAttribute`.',
            category: "Code improvements",
            recommended: false,
            url: "https://ecolint.org/docs/rules/no-attr"
        },
        messages: {
            suggestion: "Most of the jQuery methods can be replaced by plain JS code, for more go to https://youmightnotneedjquery.com/"
        },
        schema: []
    },

    create: function (context) {
        const methods = ['attr', 'removeAttr']
        return {
            'CallExpression:exit': function (node) {
                if (node.callee.type !== 'MemberExpression') {
                    return;
                }
                const name = node.callee.property.name;
                if (!methods.includes(name)) {
                    return;
                }
                if (utils.isjQuery(context, node.callee)) {
                    context.report({
                        node: node,
                        message: 'attr and remove attr can be replaced with ' +
                            'methods: `getAttribute` / `setAttribute` / `removeAttribute`',
                    });
                }
            }
        }
    }
}