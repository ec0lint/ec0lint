/* ec0lint-disable */
'use strict';

const rule = require( '../../../lib/rules/no-autoplay' );
const { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run( 'no-autoplay', rule, {
	valid: [ 'src="https://www.youtube.com/embed/tgbNymZ7vqY"',
           'src="https://www.youtube.com/embed/jlkjsldkjslk"'
         ],
	invalid: [
		{
			code: 'src="https://www.youtube.com/embed/tgbNymZ7mvqY?autoplay=1&mute=1"',
			errors: [{ messageId: "error" }]
		},
    {
			code: 'src="https://www.youtube.com/embed/jlkjsldkjsflk?mute=1&autoplay=1"',
			errors: [{ messageId: "error" }]
		},
  ]
});
