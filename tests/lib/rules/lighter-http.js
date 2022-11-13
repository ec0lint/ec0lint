"Remove it from your app and use strict";

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
            errors: [{ message: "axios can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var axios = require('axios')",
            errors: [{ message: "axios can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as axios from 'axios'",
            errors: [{ message: "axios can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import got from 'got'",
            errors: [{ message: "got can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var got = require('got')",
            errors: [{ message: "got can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as got from 'got'",
            errors: [{ message: "got can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import request from 'request'",
            errors: [{ message: "request can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var request = require('request')",
            errors: [{ message: "request can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as request from 'request'",
            errors: [{ message: "request can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import makeFetchHappen from 'make-fetch-happen'",
            errors: [{ message: "make-fetch-happen can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var makeFetchHappen = require('make-fetch-happen')",
            errors: [{ message: "make-fetch-happen can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as makeFetchHappen from 'make-fetch-happen'",
            errors: [{ message: "make-fetch-happen can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import superagent from 'superagent'",
            errors: [{ message: "superagent can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var superagent = require('superagent')",
            errors: [{ message: "superagent can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as superagent from 'superagent'",
            errors: [{ message: "superagent can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import needle from 'needle'",
            errors: [{ message: "needle can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var needle = require('needle')",
            errors: [{ message: "needle can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as needle from 'needle'",
            errors: [{ message: "needle can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import simpleGet from 'simple-get'",
            errors: [{ message: "simple-get can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var simpleGet = require('simple-get')",
            errors: [{ message: "simple-get can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as simpleGet from 'simple-get'",
            errors: [{ message: "simple-get can be removed from your code and replaced by fetch (you can find examples on http://ec0lint.com/features/lighter-http). CO2 Reduction: up to 0.21 g" }]
        }
    ]
});
