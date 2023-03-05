/* ec0lint-disable */
'use strict';

const rule = require('../../../lib/rules/no-box-model'),
    { RuleTester } = require("../../../lib/rule-tester");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

const boxModelError = "Most of the jQuery methods can be replaced by plain JS code, for more go to https://youmightnotneedjquery.com/"

ruleTester.run( 'no-box-model', rule, {
	valid: [ 'boxModel', 'a.boxModel', 'boxModel.foo', 'a.boxModel.foo' ],
	invalid: [
		{
			code: '$.boxModel',
			errors: [ boxModelError ]
		},
		{
			code: '$.boxModel.style',
			errors: [ boxModelError ]
		}
	]
} );