'use strict';

const rule = require('../../../lib/rules/no-and-self'),
    { RuleTester } = require("../../../lib/rule-tester");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

const error = 'Prefer .addBack to .andSelf';

ruleTester.run('no-and-self', rule, {
    valid: ['andSelf()', '[].andSelf()', 'div.andSelf()', 'div.andSelf'],
    invalid: [
        {
            code: '$("div").andSelf(".foo")',
            errors: [error],
        },
        {
            code: '$div.andSelf(".foo")',
            errors: [error],
        },
        {
            code: '$("div").first().andSelf()',
            errors: [error],
        },
        {
            code: '$("div").append($("input").andSelf())',
            errors: [error],
        }
    ]
});