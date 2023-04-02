/**
 * @fileoverview Rule to avoid heavy image files
 * @author Martyna Babiak
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const sizeOf = require('image-size');
const fs = require('fs');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------


/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: "problem",

        docs: {
            description: "Avoid heavy image files",
            category: "Code improvements",
            recommended: false,
            url: "https://ec0lint.com/features/lighter-image-files",
        },
        messages: {
            rejected:
                "Image file is too heavy. Try converting it to WebP or SVG format." +
                "Estimated CO2 reduction: "
        },
        schema: [], // no options,
    },
  create: function(context) {

    	function isImage(value) {

        	return value.toLowerCase().match(/\.svg|\.webp|\.jpg|\.jpeg|\.gif|\.png|\.ppm|\.tiff|\.psd/)
        }


    	function getImageSize(value) {
        	const stats = fs.statSync(value);

			    return stats.size
        }


    	function getImageDimensions(value) {
          const dimensions = sizeOf(value);

          return dimensions.width * dimensions.height
        }


    	function calculateRatio(size, dimensions) {

        	 return size / dimensions
        }


      	function isHeavy(value) {

          	return calculateRatio(getImageSize(value), getImageDimensions(value)) > 0.25
      	}


        return {
            ImportDeclaration: function(node) {
            	const value = node.source.value;

             	if ((typeof value === "string") && isImage(value) && isHeavy(value)) {
                	context.report({
                    node: node,
                    messageId: "rejected",
                    data: { value }
                    });
                }
            }

        };
    }
};
