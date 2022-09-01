"use strict";

const rule = require("../../../lib/rules/lighter-image-file"),
    { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("lighter-image-file", rule, {
    valid: [
        "import foo from './foo.gif'",
        "import foo from './foo.jpg'",
        "import foo from './foo.jpeg'",
        "import foo from './foo.svg'",
        "import foo from './foo.webp'",
        "import {ReactComponent as foo} from './foo.gif'",
        "import {ReactComponent as foo} from './foo.jpg'",
        "import {ReactComponent as foo} from './foo.jpeg'",
        "import {ReactComponent as foo} from './foo.jsvg'",
        "import {ReactComponent as foo} from './foo.jpg'",
        "let Foo = require('../src/foo.gif')",
        "let Foo = require('../src/foo.jpg')",
        "let Foo = require('../src/foo.jpeg')",
        "let Foo = require('../src/foo.svg')",
        "let Foo = require('../src/foo.webp')",
        "src='https://reactjs.org/logo-og.png'"
    ],
    invalid: [
        {
            code: "import foo from './foo.png'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import foo from './foo.ppm'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import foo from './foo.ps'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import foo from './foo.rgb'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import foo from './foo.tiff'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import foo from './foo.psd'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.png'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.ppm'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.ps'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.rgb'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.tiff'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.psd'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "let Foo = require('../src/foo.png')",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "let Foo = require('../src/foo.ppm')",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "let Foo = require('../src/foo.ps')",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "let Foo = require('../src/foo.rgb')",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "let Foo = require('../src/foo.tiff')",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "let Foo = require('../src/foo.psd')",
            errors: [{ messageId: "rejected" }]
        }
    ]
});
