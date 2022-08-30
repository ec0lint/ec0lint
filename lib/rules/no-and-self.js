/**
 * @fileoverview Rule to avoid of using and or self
 * @author Julia Ziębińska
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

'use strict';

const { id } = require('common-tags');
const ast_types = require('ast-types')

/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallows to use and or self',
            category: "Code improvements",
            recommended: false,
            url: "https://eslint.org/docs/rules/no-and-self"
        },
        messages: {
            suggestion: "Prefer .addBack to .andSelf"
        },
        schema: []
    },
    create: function (context) {
        return {
            'CallExpression:exit': function (node) {
                let expression = node
                const isJQueryExp = node.callee.object ? node.callee.object.name?.startsWith('$') : node.callee.name.startsWith('$')
                if (!isJQueryExp) {
                    return;
                }

                while (expression?.parent && expression?.type !== 'Program') {
                    const matcher = expression.parent.property?.name === 'andSelf' || expression.callee?.property?.name === 'andSelf'
                    if (matcher) {
                        context.report({
                            node: node,
                            messageId: 'suggestion',
                            data: { method: 'andSelf' }
                        });
                        return
                    }
                    expression = expression.parent
                }
            }
        }
    }
}
