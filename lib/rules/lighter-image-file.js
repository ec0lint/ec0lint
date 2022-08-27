/**
* @fileoverview Rule to avoid heavy image file formats
* @author Martyna Babiak
*/

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const moduleVisitor = require("eslint-module-utils/moduleVisitor");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
    meta: {
        type: "problem",

        docs: {
            description: "Avoid heavy formats of image files",
            category: "Code improvements",
            recommended: false,
            url: "https://eslint.org/docs/rules/lighter-image-react"
        },
        messages: {
          rejected: 'Format of image files can be changed to WebP or SVG. CO2 reduction: up to 99% of the image file.\n' +
		                'Your image can be converted online at https://cloudconvert.com/\n' +
		                'Estimated CO2 reduction that you can achieve by converting your file is: '
        },
        schema: [] // no options,
    },
    create: function(context) {
        const options = {};
        const allowed = options.allow || [];

        /**
         * Returns if the image file format is heavy
         * @param {string} name Module name
         * @returns {boolean} Returns true or false
         */
        function isBanned(name) {

            if (!name) {
                return false;
            }
            const result = name.match(/\.png|\.ppm|\.ps|\.rgb|\.tiff|\.psd/);

            return result;
        }

        /**
         * Reports the given import
         * @param {Node} node Import node to check
         * @param {string} name Name of the import
         * @returns {void}
         */
        function reportMessage(node, name) {

            if (allowed.indexOf(name) === -1 && isBanned(name)) {
                context.report({ node, messageId: "rejected", data: { name }});
            }
        }

        return moduleVisitor.default((source, node) => {
            reportMessage(node, source.value);
        },
        { commonjs: true });
    }
};
