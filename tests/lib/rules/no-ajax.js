/* ec0lint-disable */
'use strict';

const rule = require('../../../lib/rules/no-ajax'),
    { RuleTester } = require("../../../lib/rule-tester");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

const ajaxError = "Most of the jQuery methods can be replaced by plain JS code, for more go to https://youmightnotneedjquery.com/"



ruleTester.run('no-ajax', rule, {
    valid: [
        'ajax()',
        'div.ajax()',
        'div.ajax',

        'get()',
        'div.get()',
        'div.get',

        'getJSON()',
        'div.getJSON()',
        'div.getJSON',

        'getScript()',
        'div.getScript()',
        'div.getScript',

        'post()',
        'div.post()',
        'div.post'
    ],
    invalid: [
        {
            code: '$.ajax()',
            errors: [ajaxError]
        },
        {
            code: '$.get()',
            errors: [ajaxError]
        },
        {
            code: '$.getJSON()',
            errors: [ajaxError]
        },
        {
            code: '$.getScript()',
            errors: [ajaxError]
        },
        {
            code: '$.post()',
            errors: [ajaxError]
        }
    ]
});