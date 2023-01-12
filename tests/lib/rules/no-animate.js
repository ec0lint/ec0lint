'use strict';

const rule = require( '../../../lib/rules/no-animate' );
 const  { RuleTester } = require("../../../lib/rule-tester");

const error = 'animate can be replaced with CSS transitions.';


const ruleTester = new RuleTester();
ruleTester.run( 'no-animate', rule, {
	valid: [
		'animate()',
		'[].animate()',
		'div.animate()',
		'div.animate',
		{
			code: '$div.animate({scrollTop: 100})',
			options: [ { allowScroll: true } ]
		},
		{
			code: '$div.animate({scrollLeft: 200})',
			options: [ { allowScroll: true } ]
		},
		{
			code: '$div.animate({scrollTop: 100, scrollLeft: 200})',
			options: [ { allowScroll: true } ]
		}
	],
	invalid: [
		{
			code: '$("div").animate()',
			errors: [ error ]
		},
		{
			code: '$div.animate()',
			errors: [ error ]
		},
		{
			code: '$div.animate()',
			options: [ { allowScroll: true } ],
			errors: [ error ]
		},
		{
			code: '$("div").first().animate()',
			errors: [ error ]
		},
		{
			code: '$("div").append($("input").animate())',
			errors: [ error ]
		},
		{
			code: '$div.animate({scrollTop: 100})',
			errors: [ error ]
		},
		{
			code: '$div.animate({scrollTop: 100})',
			options: [ { allowScroll: false } ],
			errors: [ error ]
		},
		{
			code: '$div.animate({scrollLeft: 200})',
			errors: [ error ]
		},
		{
			code: '$div.animate({scrollTop: 100, scrollLeft: 200})',
			errors: [ error ]
		},
		{
			code: '$div.animate({scrollTop: 100, width: 300})',
			errors: [ error ]
		},
		{
			code: '$div.animate({scrollTop: 100, width: 300})',
			options: [ { allowScroll: true } ],
			errors: [ error ]
		}
	]
} );