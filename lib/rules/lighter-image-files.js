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
                "Format of image files can be changed to WebP or SVG"
        },
        schema: [], // no options,
    },
  create: function(context) {

    	function isImage(value) {

        	return value.toLowerCase().match(/\.avif|\.svg|\.webp|\.jpg|\.jpeg|\.gif|\.png|\.ppm|\.ps|\.rgb|\.tiff|\.psd/)
        }


    	function getImageSize(value) {
        	const stats = fs.statSync(value);

			    return stats.size
        }


    	function getImageDimensions(value) {
        	sizeOf(value, function (err, dimensions) {
          	const width = dimensions.width;
          	const height = dimensions.height;
        	});

        	return width * height
        }


    	function calculateRatio(size, dimensions) {

        	 return size / dimensions
        }


      	function isHeavy(value) {

          	return calculateRatio(getImageSize(value), getImageDimensions(value)) > 0.3
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
