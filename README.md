![ec0lint](/docs/banner_github.png)

[![npm version](https://img.shields.io/npm/v/ec0lint.svg)](https://www.npmjs.com/package/ec0lint)
[![Downloads](https://img.shields.io/npm/dm/ec0lint.svg)](https://www.npmjs.com/package/ec0lint)
[![Build Status](https://github.com/ec0lint/ec0lint/workflows/CI/badge.svg)](https://github.com/ec0lint/ec0lint/actions)
[![Open Collective Sponsors](https://img.shields.io/opencollective/sponsors/ec0lint)](https://opencollective.com/ec0lint)
[![Linkedin](https://img.shields.io/badge/LinkedIn-ec0lint-blue)](https://www.linkedin.com/company/ec0lint/)

[Website](http://ec0lint.com) |
[Configuring](https://eslint.org/docs/user-guide/configuring/) |
[Rules](http://ec0lint.com/features)

ec0lint is a static code analysis tool that provides users with hints on how to reduce the carbon footprint of their websites during the development process. Applying code changes suggested by ec0lint results in lower carbon emissions per visit, quicker loading and higher space efficiency. The tool is open-source and community-driven.

# Our goal

Did you know that more than 250 000 websites are published every day?

The majority uses too heavy fonts, too large/unnecessary images or utilises redundant libraries. These and other factors generate the carbon footprint. Actually, one view of an average website emits 1.8 g CO2 which sums up to 216 kg CO2 annually. Unfortunately, current solutions optimise only already existing websites.

ec0lint is a tool for frontend developers that mitigates the carbon footprint of websites. It shows tips advising how to create a more climate-friendly code. Thanks to code optimization ec0lint can help in reducing CO2 emissions per one view from 1.8 g to ~0.2 g saving 198 kg CO2 (-88%!) annually.

The tool is customized and each rule applied during the analysis can be adjusted, or treated as hints rather than errors. This flexibility allows the developers to reach their goals without interruptions from ec0lint, at the same time drawing attention to possible improvements.

# Get started

Make sure you have Node installed

Download ec0lint:

`npm i ec0lint ec0lint-style ec0lint-style-config-recommended`

Configure your project:

`npm init @ec0lint/config`

Create a .ec0lint-stylerc.json configuration file in the root of your project with the following content:

`{ "extends": "ec0lint-style-config-recommended" } `

Split your terminal and run:

`npx ec0lint-style "**/*.css" npx ec0lint .`

Let's build an eco-friendly website!

# Release plan

:white_check_mark: v1.0.0 - June - MVP

- :white_check_mark: Lighter HTTP (lighter-http, ec0lint)
- :white_check_mark: Font format (no-ttf-font-files, ec0lint-style)
- :white_check_mark: Image format validation (lighter-image-files, ec0lint-style)
- :white_check_mark: Light libraries - lodash (avoid-lodash, ec0lint)
- :white_check_mark: Light libraries - date-fns (no-date-fns, ec0lint)
- :white_check_mark: Light libraries - moment.js (no-moment-js, ec0lint)

:white_check_mark: v2.0.0 - October - CO2 modules + React plugin

- :white_check_mark: CO2 calculation (ec0lint)
- :white_check_mark: CO2 calculation (ec0lint-style)
- :white_check_mark: Plugin React (ec0lint-plugin-react)
- :white_check_mark: Light libraries - jQuery Ajax (no-ajax, ec0lint)
- :white_check_mark: Light libraries - jQuery Ajax events (no-ajax-events, ec0lint)
- :white_check_mark: Font-display (require-font-display, ec0lint-style)

:white_check_mark: v2.1.0 - January - 20 rule implementations, 15 unique rules

- :white_check_mark: Image format (lighter-image-files, ec0lint)
- :white_check_mark: Video format (lighter-video-files, ec0lint)
- :white_check_mark: Plugin HTML (ec0lint-plugin-html)
- :white_check_mark: Lazy loading (require-lazy-loading, ec0lint-plugin-html)
- :white_check_mark: Font source (no-hosted-online-fonts, ec0lint-style)
- :white_check_mark: Light libraries - jQuery andSelf (no-and-self, ec0lint)
- :white_check_mark: Light libraries – jQuery Animate (no-animate, ec0lint)
- :white_check_mark: Light libraries – jQuery Attr (no-attr, ec0lint)
- :white_check_mark: Light libraries – jQuery Bind (no-bind, ec0lint)
- :white_check_mark: Video auto-play (require-auto-play, ec0lint)

:hammer: v3.0.0 - March - IDE plugins + resources scanning

- :four_leaf_clover: VSCode plugin
- :four_leaf_clover: IntelliJ plugin
- :hammer: Colors validation (background-color-validation, ec0lint-style)
- :four_leaf_clover: Image size (image-size-validation, ec0lint)
- :four_leaf_clover: Video size (video-size-validation, ec0lint)
- :four_leaf_clover: Images number (image-number-validation, ec0lint)
- :four_leaf_clover: Videos number (video-number-validation, ec0lint)
- :four_leaf_clover: Light libraries – jQuery Bind (no-bind, ec0lint)
- :four_leaf_clover: Light libraries – jQuery Box Model (no-box-model, ec0lint)
- :four_leaf_clover: Light libraries – jQuery Browser (no-browser, ec0lint)
- :hammer: Automatic releases tool

:lock: v4.0.0 - June - TypeScript plugin

- TypeScript plugin (ec0lint-plugin-typescript)
- Lighter HTTP (lighter-http, ec0lint-plugin-typescript)
- Light libraries - lodash (avoid-lodash, ec0lint-plugin-typescript)
- Light libraries - date-fns (no-date-fns, ec0lint-plugin-typescript)
- Light libraries - moment.js (no-moment-js, ec0lint-plugin-typescript)
- Light libraries - jQuery Ajax (no-ajax, ec0lint-plugin-typescript)
- Light libraries - jQuery Ajax events (no-ajax-events ec0lint-plugin-typescript)
- Video format (lighter-video-files, ec0lint-plugin-typescript)
- Lazy loading (require-lazy-loading, ec0lint-plugin-typescript)
- Video auto-play (require-auto-play, ec0lint-plugin-typescript)

:lock: v5.0.0 - September - CI/CD report

- CI/CD report
- research - user tracking scripts
- research - dark mode
- research - new rules
- new rules

Next:

- :lock: Website budget
- :lock: Angular plugin
- :lock: Vue plugin
- :lock: --fix option

Legend:

- :white_check_mark: released
- :ballot_box_with_check: implemented, not yet released
- :hammer: in progress
- :four_leaf_clover: task to take
- :lock: to do in future releases

# How to start contributing

If you wish to contribute, just write to us and start coding!

You can look at tasks marked as :four_leaf_clover: or at our issues (https://github.com/ec0lint/ec0lint/issues) and search for a task for you.

Thank you!

We are open to collaboration on improving ec0lint, and we are very grateful for all contributions and feedback on the tool. Thank you for creating sustainable digital environment with us!

Conctact: ec0lint@tutanota.com
