"use strict";

const rule = require("../../../lib/rules/no-moment-js"),
    { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("no-moment-js", rule, {
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
            code: "import moment from 'moment'",
            errors: [{ message: "You can replace Moment.js by using built-in native datetime format. CO2 Reduction: 1.51 g" }]
        },
        {
            code: "var moment = require('moment')",
            errors: [{ message: "You can replace Moment.js by using built-in native datetime format. CO2 Reduction: 1.51 g" }]
        },
        {
            code: "import * as moment from 'moment'",
            errors: [{ message: "You can replace Moment.js by using built-in native datetime format. CO2 Reduction: 1.51 g" }]
        },
        {
            code: "import _ from 'moment'",
            errors: [{ message: "You can replace Moment.js by using built-in native datetime format. CO2 Reduction: 1.51 g" }]
        },
        {
            code: "var _ = require('moment')",
            errors: [{ message: "You can replace Moment.js by using built-in native datetime format. CO2 Reduction: 1.51 g" }]
        }
    ]
});
