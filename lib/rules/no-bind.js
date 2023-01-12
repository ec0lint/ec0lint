'use strict';

/**
 * @fileoverview Rule to avoid of using bind.
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
            description: 'Disallows bind utilities: bind, unbind. Prefer `.on`/`.off` or `EventTarget#addEventListener`/`removeEventListener`',
            category: "Code improvements",
            recommended: false,
            url: "https://ecolint.org/docs/rules/no-bind"
        },
        messages: {
            suggestion: "Most of the jQuery methods can be replaced by plain JS code, for more go to https://youmightnotneedjquery.com/"
        },
        schema: []
    },

    create: function (context) {
        const methods = [ 'bind', 'unbind' ]
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
                        message: 'bind and unbind methods can be replaced with ' +
                            '`.on`/`.off` or `EventTarget#addEventListener`/`removeEventListener`',
                    });
                }
            }
        }
    }
}
