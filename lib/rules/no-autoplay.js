/**
 * @fileoverview Rule to disallow autoplay property
 * @author Martyna Babiak
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: "problem",

        docs: {
            description: "Disallows autoplay property in embedded videos",
            recommended: false,
            url: "https://ec0lint.com/features/no-autoplay"
        },
        messages: {
          error: 'Autoplay property slows down your webpage'
        },
        schema: [] // no options
    },

    create: function(context) {
        return {
            Literal: function(node) {
              const value = node.value;
            	if (value.match(/[\?\&]autoplay=1/)) {
                  context.report({
                    node: node,
                    messageId: "error",
                    data: { value }
                    });
                }
            }
        };
    }
};
