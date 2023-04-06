"use strict";

const rule = require("../../../lib/rules/lighter-image-formats"),
    { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("lighter-image-formats", rule, {
    valid: [
        "import foo from './foo.avif'",
        "import foo from './foo.jpg'",
        "import foo from './foo.jpeg'",
        "import foo from './foo.svg'",
        "import foo from './foo.webp'",
        "import {ReactComponent as foo} from './foo.avif'",
        "import {ReactComponent as foo} from './foo.jpg'",
        "import {ReactComponent as foo} from './foo.jpeg'",
        "import {ReactComponent as foo} from './foo.svg'",
        "import {ReactComponent as foo} from './foo.webp'",
        "let Foo = require('../src/foo.avif')",
        "let Foo = require('../src/foo.jpg')",
        "let Foo = require('../src/foo.jpeg')",
        "let Foo = require('../src/foo.svg')",
        "let Foo = require('../src/foo.webp')"
    ],
    invalid: [
        {
            code: "import foo from './foo.gif'",
            errors: [{ messageId: "rejected" }]
        },
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
            code: "import {ReactComponent as foo} from './foo.gif'",
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
            code: "let Foo = require('../src/foo.gif')",
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
        }
    ]
});
