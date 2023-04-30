"use strict";

const rule = require("../../../lib/rules/lighter-image-files"),
    { RuleTester } = require("../../../lib/rule-tester");

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2022, sourceType: "module" } });

ruleTester.run("lighter-image-files", rule, {
    valid: [
      {
        code: "import image from 'tests/testResources/image_0.20.webp'"
      },
      {
        code: "import image from 'tests/testResources/image_0.17.jpeg'"
      },
      {
        code: "import image from 'tests/testResources/image_0.04.png'"
      },
      {
        code: "import image from 'tests/testResources/image_0.25.jpeg'"
      },
    ],

    invalid: [
      {
        code: "import image from 'tests/testResources/image_1.70.png'",
        errors: [{ messageId: "rejected" }]
      },
      {
        code: "import image from 'tests/testResources/image_0.33.jpeg'",
        errors: [{ messageId: "rejected" }]
      },
      {
        code: "import image from 'tests/testResources/image_1.08.jpeg'",
        errors: [{ messageId: "rejected" }]
      },
      {
        code: "import image from 'tests/testResources/image_0.29.jpeg'",
        errors: [{ messageId: "rejected" }]
      }
    ]
});
