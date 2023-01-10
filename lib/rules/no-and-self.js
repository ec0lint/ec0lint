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
const astUtils = require('./utils/ast-utils');

/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallows to use and or self',
            category: "Code improvements",
            recommended: false,
            url: "https://ec0lint.com/features/no-and-self"
        },
        messages: {
            suggestion: "Prefer .addBack to .andSelf"
        },
        schema: []
    },
    create: function (context) {
        const sourceCode = context.getSourceCode();

        return {
            'Program:exit': function (node) {
                const code = sourceCode.lines
                if (code.some((line) => line.match(/.*[$].+(andSelf)/))) {
                    context.report({
                        node: node,
                        messageId: 'suggestion',
                        data: { method: 'andSelf' }
                    });
                    return
                }
            }
        }
    }
}
