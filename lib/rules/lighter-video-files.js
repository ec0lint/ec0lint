/**
* @fileoverview Rule to avoid heavy video file formats
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
            description: "Avoid heavy formats of video files",
            category: "Code improvements",
            recommended: false,
            url: "https://eslint.org/docs/rules/lighter-video-files"
        },
        messages: {
          rejected: 'Format of video files can be changed to WebM. Your video can be converted online at https://www.veed.io/convert/video-converter\n' +
 		            'Estimated CO2 reduction that you can achieve by converting your file is: '
        },
        schema: [] // no options,
    },
    create: function(context) {

        /**
         * Returns if the video file format is heavy
         * @param {string} name
         * @returns {boolean} Returns true or false
         */
        function isBanned(name) {

            if (!name) {
                return false;
            }
            const result = name.match(/\.ogg|\.mp4|\.m4a|\.m4p|\.m4b|\.m4r|\.m4v/);

            return result;
        }

        /**
         * Reports the given import
         * @param {Node} node Import node to check
         * @param {string} name Name of the import
         * @returns {void}
         */
        function reportMessage(node, name) {

            if (isBanned(name)) {
                context.report({ node, messageId: "rejected", data: { name }});
            }
        }

        return moduleVisitor.default((source, node) => {
            reportMessage(node, source.value);
        },
        { commonjs: true });
    }
};
