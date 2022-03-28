"use strict";

const rule = require("../../../lib/rules/lighter-http"),
    { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("lighter-http", rule, {
    valid: [
        "import _ from 'lodash'",
        "import find from 'lodash.find'",
        "import foo from './ foo'",
        "import foo from '../foo'",
        "import foo from 'foo'",
        "import foo from './'",
        "import foo from '@scope/foo'",
        "var _ = require('lodash')",
        "var find = require('lodash.find')",
        "var foo = require('./foo')",
        "var foo = require('../foo')",
        "var foo = require('foo')",
        "var foo = require('./')",
        "var foo = require('@scope/foo')"
    ],
    invalid: [
        {
            code: "import axios from 'axios'",
            errors: [{ message: "Do not import axios. Instead use fetch." }]
        },
        {
            code: "var axios = require('axios')",
            errors: [{ message: "Do not import axios. Instead use fetch." }]
        },
        {
            code: "import * as axios from 'axios'",
            errors: [{ message: "Do not import axios. Instead use fetch." }]
        },
        {
            code: "import got from 'got'",
            errors: [{ message: "Do not import got. Instead use fetch." }]
        },
        {
            code: "var got = require('got')",
            errors: [{ message: "Do not import got. Instead use fetch." }]
        },
        {
            code: "import * as got from 'got'",
            errors: [{ message: "Do not import got. Instead use fetch." }]
        }
    ]
});
