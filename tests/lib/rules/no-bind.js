'use strict';

const rule = require( '../../../lib/rules/no-bind' );
const { RuleTester } = require("../../../lib/rule-tester");

const error = 'bind and unbind methods can be replaced with ' +
                            '`.on`/`.off` or `EventTarget#addEventListener`/`removeEventListener`'

const ruleTester = new RuleTester();
ruleTester.run( 'no-bind', rule, {
	valid: [
		'bind()',
		'[].bind()',
		'div.bind()',
		'div.bind',
		'$div.remove.bind($div)',

		'unbind()',
		'[].unbind()',
		'div.unbind()',
		'div.unbind',
		'$div.remove.unbind($div)'
	],
	invalid: [
		[ '$("div").bind()', error ],
		[ '$div.bind()', error ],
		[ '$("div").first().bind()', error ],
		[ '$("div").append($("input").bind())', error ],

		[ '$("div").unbind()', error ],
		[ '$div.unbind()', error ],
		[ '$("div").first().unbind()', error ],
		[ '$("div").append($("input").unbind())', error ]
	].map( ( codeError ) => ( {
		code: codeError[ 0 ],
		errors: [ codeError[ 1 ] ]
	} ) )
} );