/**
 * @fileoverview Rule to avoid of using animate.
 * @author Julia Ziębińska
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const utils = require( './utils/utils' );

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallows the ' + utils.jQueryCollectionLink( 'animate' ) +
				' method. Use the `allowScroll` option to allow animations which are just used for scrolling. Prefer CSS transitions.',
            category: "Code improvements",
            recommended: false,
            url: "https://eslint.org/docs/rules/no-animate"
        },
		schema: [
			{
				type: 'object',
				properties: {
					allowScroll: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		]
	},

	create: function ( context ) {
		return {
			'CallExpression:exit': function ( node ) {
				if (
					node.callee.type !== 'MemberExpression' ||
					node.callee.property.name !== 'animate'
				) {
					return;
				}
				const allowScroll = context.options[ 0 ] && context.options[ 0 ].allowScroll;
				if ( allowScroll ) {
					const arg = node.arguments[ 0 ];
					// Check properties list has more than just scrollTop/scrollLeft
					if ( arg && arg.type === 'ObjectExpression' ) {
						if (
							arg.properties.every(
								( prop ) => prop.key.name === 'scrollTop' || prop.key.name === 'scrollLeft'
							)
						) {
							return;
						}
					}
				}

				if ( utils.isjQuery( context, node ) ) {
					context.report( {
						node: node,
						message: 'animate can be replaced with CSS transitions.'
					} );
				}
			}
		};
	}
};