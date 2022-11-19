'use strict';

const rule = require( '../../../lib/rules/no-attr' );
const { RuleTester } = require("../../../lib/rule-tester");

const error = 'Prefer `Element#getAttribute`/`setAttribute`/`removeAttribute`';

const ruleTester = new RuleTester();
ruleTester.run( 'no-attr', rule, {
	valid: [ 'attr()', '[].attr()', 'div.attr()', 'div.attr', 'removeAttr()', 'div.removeAttr' ],
	invalid: [
		{
			code: '$.attr()',
			errors: [ error ]
		},
		{
			code: '$("div").attr()',
			errors: [ error ]
		},
		{
			code: '$div.attr()',
			errors: [ error ]
		},
		{
			code: '$("div").first().attr()',
			errors: [ error ]
		},
		{
			code: '$("div").append($("input").attr())',
			errors: [ error ]
		},
		{
			code: '$("div").attr("name")',
			errors: [ error ]
		},
		{
			code: '$("div").attr("name", "random")',
			errors: [ error ]
		},
		{
			code: '$.removeAttr()',
			errors: [ error ]
		},
		{
			code: '$("div").removeAttr("name")',
			errors: [ error ]
		}
	]
} );