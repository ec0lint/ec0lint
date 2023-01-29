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
            description: "Disallows autoplay property in embedded YouTube videos",
            recommended: false,
            url: "https://ec0lint.com/features/no-autoplay"
        },
        messages: {
          error: 'Autoplay property in YouTube links makes the video download upfront. Delete it from the URL.'
        },
        schema: [] // no options
    },

    create: function(context) {
        return {
            Literal: function(node) {
              const value = node.value;
            	if ((typeof value === "string") && (value.match(/.*youtube\.com.*[\?\&]autoplay=1/))) {
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
