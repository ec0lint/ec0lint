![ec0lint](/docs/banner_github.png)

[![npm version](https://img.shields.io/npm/v/ec0lint.svg)](https://www.npmjs.com/package/ec0lint)
[![Downloads](https://img.shields.io/npm/dm/ec0lint.svg)](https://www.npmjs.com/package/ec0lint)
[![Build Status](https://github.com/ec0lint/ec0lint/workflows/CI/badge.svg)](https://github.com/ec0lint/ec0lint/actions)

[Website](http://ec0lint.com) |
[Configuring](https://eslint.org/docs/user-guide/configuring/) |
[Rules](http://ec0lint.com/features)

ec0lint is a static code analysis tool that provides users with hints on how to reduce the carbon footprint of their websites during the development process. Applying code changes suggested by ec0lint results in lower carbon emissions per visit, quicker loading and higher space efficiency. The tool is open-source and community-driven.

## Our goal

Did you know that more than 250 000 websites are published every day?

The majority uses too heavy fonts, too large/unnecessary images or utilises redundant libraries. These and other factors generate the carbon footprint. Actually, one view of an average website emits 4.6 g CO2 which sums up to 553 kg CO2 annually. Unfortunately, current solutions optimise only already existing websites.

ec0lint is a tool for frontend developers that mitigates the carbon footprint of websites. It shows tips advising how to create a more climate-friendly code. Thanks to code optimization ec0lint can help in reducing CO2 emissions per one view from 4.6 g to ~0.2 g saving 529 kg CO2 (-96%!) annually. 

The tool is customized and each rule applied during the analysis can be adjusted, or treated as hints rather than errors. This flexibility allows the developers to reach their goals without interruptions from ec0lint, at the same time drawing attention to possible improvements.

## Get started 

Make sure you have Node installed 

Download ec0lint: 

`npm i ec0lint ec0lint-css ec0lint-css-config-recommended`

Configure your project: 

`npm init @ec0lint/config`

Create a .ec0lint-cssrc.json configuration file in the root of your project with the following content: 

`{ 
 "extends": "ec0lint-css-config-recommended" 
}
`

Split your terminal and run: 

`npx ec0lint-css "**/*.css"  npx ec0lint .`

Let's build an eco-friendly website!

## How to start contributing

If you wish to contribute, just write to us and start coding!

You can also look at our issues and search for a task for you.

Thank you!

We are open to collaboration on improving ec0lint, and we are very grateful for all contributions and feedback on the tool. Thank you for creating sustainable digital environment with us!
