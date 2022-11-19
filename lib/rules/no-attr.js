'use strict';

/**
 * @fileoverview Rule to avoid of using ajax events
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
            url: "https://eslint.org/docs/rules/no-attr"
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
                        message: 'Prefer `Element#getAttribute`/`setAttribute`/`removeAttribute`',
                    });
                }
            }
        }
    }
}

// utils.createCollectionOrUtilMethodRule(
//             ['attr', 'removeAttr'],
//             (node) => node === true ?
//                 'Prefer `Element#getAttribute`/`setAttribute`/`removeAttribute`' :
//                 'Prefer Element#' +
//                 (
//                     node.callee.property.name === 'removeAttr' ? 'removeAttribute' :
//                         node.arguments.length === 2 ? 'setAttribute' : 'getAttribute'
//                 ) +
//                 ' to .' + node.callee.property.name + '/$.' + node.callee.property.name
//         )