"use strict";

const rule = require("../../../lib/rules/avoid-lodash"),
    { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("avoid-lodash", rule, {
    valid: [
        "import foo from './ foo'",
        "import foo from '../foo'",
        "import foo from 'foo'",
        "import foo from './'",
        "import foo from '@scope/foo'",
        "var foo = require('./foo')",
        "var foo = require('../foo')",
        "var foo = require('foo')",
        "var foo = require('./')",
        "var foo = require('@scope/foo')"
    ],
    invalid: [
        {
            code: "import lodash from 'lodash'",
            errors: [{ message: "You can replace most of the lodash methods, for more go there https://youmightnotneed.com/lodash ." }]
        },
        {
            code: "var lodash = require('lodash')",
            errors: [{ message: "You can replace most of the lodash methods, for more go there https://youmightnotneed.com/lodash ." }]
        },
        {
            code: "import * as lodash from 'lodash'",
            errors: [{ message: "You can replace most of the lodash methods, for more go there https://youmightnotneed.com/lodash ." }]
        },
        {
            code: "import _ from 'lodash'",
            errors: [{ message: "You can replace most of the lodash methods, for more go there https://youmightnotneed.com/lodash ." }]
        },
        {
            code: "import find from 'lodash.find'",
            errors: [{ message: "You can replace most of the lodash methods, for more go there https://youmightnotneed.com/lodash ." }]
        },
        {
            code: "var _ = require('lodash')",
            errors: [{ message: "You can replace most of the lodash methods, for more go there https://youmightnotneed.com/lodash ." }]
        },
        {
            code: "var find = require('lodash.find')",
            errors: [{ message: "You can replace most of the lodash methods, for more go there https://youmightnotneed.com/lodash ." }]
        }
    ]
});
