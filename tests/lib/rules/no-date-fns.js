"use strict";

const rule = require("../../../lib/rules/no-date-fns"),
    { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("no-date-fns", rule, {
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
            code: "import dateFns from 'date-fns'",
            errors: [{ message: "You can replace date-fns by Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g" }]
        },
        {
            code: "var dateFns = require('date-fns')",
            errors: [{ message: "You can replace date-fns by Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g" }]
        },
        {
            code: "import * as dateFns from 'date-fns'",
            errors: [{ message: "You can replace date-fns by Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g" }]
        },
        {
            code: "import _ from 'date-fns'",
            errors: [{ message: "You can replace date-fns by Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g" }]
        },
        {
            code: "import format from 'date-fns.format'",
            errors: [{ message: "You can replace date-fns by Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g" }]
        },
        {
            code: "var _ = require('date-fns')",
            errors: [{ message: "You can replace date-fns by Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g" }]
        },
        {
            code: "var format = require('date-fns.format')",
            errors: [{ message: "You can replace date-fns by Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g" }]
        },
        {
            code: "import { format, formatDistance, formatRelative, subDays } from 'date-fns'",
            errors: [{ message: "You can replace date-fns by Intl.DateTimeFormat - it's perfectly supported by all modern browsers and Node.js. CO2 Reduction: 2.32 g" }]
        }
    ]
});
