"use strict";

const rule = require("../../../lib/rules/lighter-video-files"),
    { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("lighter-video-files", rule, {
    valid: [
        "import video from './video.webm'",
        "import {ReactComponent as video} from './video.webm'",
        "let Video = require('../src/video.webm')"
    ],
    invalid: [
        {
            code: "import foo from './foo.ogg'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import foo from './foo.mp4'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import foo from './foo.m4a'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import foo from './foo.m4p'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.m4b'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.m4r'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "import {ReactComponent as foo} from './foo.m4v'",
            errors: [{ messageId: "rejected" }]
        },
        {
            code: "let Foo = require('../src/foo.m4v')",
            errors: [{ messageId: "rejected" }]
        }
    ]
});
