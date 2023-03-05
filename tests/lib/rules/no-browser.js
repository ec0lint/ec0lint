/* ec0lint-disable */
'use strict';

const rule = require('../../../lib/rules/no-browser');
const {RuleTester} = require("../../../lib/rule-tester");

const error = 'browser property can be replaced Navigator object from Window.navigator';

const ruleTester = new RuleTester();
ruleTester.run('no-browser', rule, {
    valid: ['navigator.userAgent'],
    invalid: [
        {
            code: '$.browser.version',
            errors: [error]
        },
        {
            code: '$.browser.msie',
            errors: [error]
        },
        {
            code: '$.browser.version',
            errors: [error]
        },
        {
            code: 'jQuery.browser()',
            errors: [error]
        }
    ]
});
