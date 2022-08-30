'use strict';

const rule = require('../../../lib/rules/no-ajax-events'),
    { RuleTester } = require("../../../lib/rule-tester");
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });


function getErrors(method) {
    return ['You can replace most of the jQuery methods, for more go to https://youmightnotneedjquery.com/'];
}

ruleTester.run('no-ajax-events', rule, {
    valid: [
        '$(document).on("click", function(e){ })',
        '$form.on("submit", function(e){ })',
        '$form.on()',
        'on("ajaxSuccess", ".js-select-menu", function(e){ })',
        'form.on("ajaxSend")',
        'form.ajaxSend()',
        '$.ajaxSend()'
    ],
    invalid: [
        {
            code: '$(document).on("ajaxSend", function(e){ })',
            errors: getErrors('ajaxSend')
        },
        {
            code: '$(document).on("ajaxSuccess", function(e){ })',
            errors: getErrors('ajaxSuccess')
        },
        {
            code: '$form.on("ajaxError", function(e){ })',
            errors: getErrors('ajaxError')
        },
        {
            code: '$form.on("ajaxComplete", function(e){ })',
            errors: getErrors('ajaxComplete')
        },
        {
            code: '$form.on("ajaxStart", function(e){ })',
            errors: getErrors('ajaxStart')
        },
        {
            code: '$form.on("ajaxStop", function(e){ })',
            errors: getErrors('ajaxStop')
        },
        {
            code: '$(document).ajaxSend(function(e){ })',
            errors: getErrors('ajaxSend')
        },
        {
            code: '$(document).ajaxSuccess(function(e){ })',
            errors: getErrors('ajaxSuccess')
        },
        {
            code: '$form.ajaxError(function(e){ })',
            errors: getErrors('ajaxError')
        },
        {
            code: '$form.ajaxComplete(function(e){ })',
            errors: getErrors('ajaxComplete')
        },
        {
            code: '$form.ajaxStart(function(e){ })',
            errors: getErrors('ajaxStart')
        },
        {
            code: '$form.ajaxStop(function(e){ })',
            errors: getErrors('ajaxStop')
        }
    ]
});