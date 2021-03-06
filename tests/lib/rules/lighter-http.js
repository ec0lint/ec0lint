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
            errors: [{ message: "Do not import axios. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var axios = require('axios')",
            errors: [{ message: "Do not import axios. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as axios from 'axios'",
            errors: [{ message: "Do not import axios. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import got from 'got'",
            errors: [{ message: "Do not import got. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var got = require('got')",
            errors: [{ message: "Do not import got. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as got from 'got'",
            errors: [{ message: "Do not import got. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import request from 'request'",
            errors: [{ message: "Do not import request. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var request = require('request')",
            errors: [{ message: "Do not import request. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as request from 'request'",
            errors: [{ message: "Do not import request. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import makeFetchHappen from 'make-fetch-happen'",
            errors: [{ message: "Do not import make-fetch-happen. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var makeFetchHappen = require('make-fetch-happen')",
            errors: [{ message: "Do not import make-fetch-happen. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as makeFetchHappen from 'make-fetch-happen'",
            errors: [{ message: "Do not import make-fetch-happen. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import superagent from 'superagent'",
            errors: [{ message: "Do not import superagent. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var superagent = require('superagent')",
            errors: [{ message: "Do not import superagent. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as superagent from 'superagent'",
            errors: [{ message: "Do not import superagent. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import needle from 'needle'",
            errors: [{ message: "Do not import needle. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var needle = require('needle')",
            errors: [{ message: "Do not import needle. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as needle from 'needle'",
            errors: [{ message: "Do not import needle. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import simpleGet from 'simple-get'",
            errors: [{ message: "Do not import simple-get. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "var simpleGet = require('simple-get')",
            errors: [{ message: "Do not import simple-get. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        },
        {
            code: "import * as simpleGet from 'simple-get'",
            errors: [{ message: "Do not import simple-get. Remove it from your app and use fetch instead (you can find examples on http://ec0lint.com/features). CO2 Reduction: up to 0.21 g" }]
        }
    ]
});
