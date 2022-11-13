/**
 * @fileoverview Rule to avoid of using ajax events
 * @author Julia Ziębińska
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------


const utils = require('./utils/utils');

const disallowedEvents = [
    'ajaxComplete',
    'ajaxError',
    'ajaxSend',
    'ajaxStart',
    'ajaxStop',
    'ajaxSuccess'
];

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallows global ajax events handlers: ' + disallowedEvents.map(utils.jQueryCollectionLink).join('/') + '. Prefer local events.',
            category: "Code improvements",
            recommended: false,
            url: "https://eslint.org/docs/rules/no-ajax-events"
        },
        messages: {
            suggestion: "Most of the jQuery methods can be replaced by plain JS code, for more go to https://youmightnotneedjquery.com/"
        },
        schema: []
    },

    create: function (context) {
        return {
            'CallExpression:exit': function (node) {
                if (node.callee.type !== 'MemberExpression') {
                    return;
                }
                let usedMethod;
                if (
                    node.callee.property.name === 'on' &&
                    node.arguments.length >= 1
                ) {
                    const arg = node.arguments[0];
                    if (
                        arg.type === 'Literal' &&
                        disallowedEvents.includes(arg.value)
                    ) {
                        usedMethod = arg.value;
                    }
                }
                if (disallowedEvents.includes(node.callee.property.name)) {
                    usedMethod = node.callee.property.name;
                }
                if (usedMethod && utils.isjQuery(context, node)) {
                    context.report({
                        node: node,
                        messageId: 'suggestion',
                        data: { method: usedMethod }
                    });
                }
            }
        };
    }
};