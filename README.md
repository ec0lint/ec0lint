[![npm version](https://img.shields.io/npm/v/ec0lint.svg)](https://www.npmjs.com/package/ec0lint)

# ec0lint

[Website] https://www.ec0lint.com/ |
[Configuring](TBD) |
[Rules](TBD)

ec0lint is a static code analysis tool that provides users with hints on how to reduce the carbon footprint of their websites during the development process. Applying code changes suggested by ec0lint results in lower carbon emissions per visit, quicker loading and higher space efficiency. The tool is open-source and community-driven.

## Our goal


Did you know that more than 250 000 websites are published every day?

The majority uses too heavy fonts, too large/unnecessary images or utilises redundant libraries. These and other factors generate the carbon footprint. Actually, one view of an average website emits 4.6 g CO2 which sums up to 552 kg CO2 annually. Unfortunately, current solutions optimise only already existing websites.

ec0lint is a tool for frontend developers that mitigates the carbon footprint of websites. It shows tips advising how to create a more climate-friendly code. Thanks to code optimization ec0lint can help in reducing CO2 emissions per one view from 4.6 g to ~0.2 g saving 528 kg CO2 (-96%!) annually. 

The tool is customized and each rule applied during the analysis can be adjusted, or treated as hints rather than errors. This flexibility allows the developers to reach their goals without interruptions from ec0lint, at the same time drawing attention to possible improvements.

## Features

Current features:
1) Font format validation
If a font format isn't WOFF, up to 80% more space will be taken. Let's change them all to WOFF!
2) Replacement of heavy libraries functions
Heavy library calls can be replaced by plain JS code. In the case of axios - when all axios functions will be removed from the code, the axios module can be deleted, saving 400 kB of space. The rule works on axios, got, request, make-fetch-happen, superagent, needle, simple-get, lodash, moment js, and date fns.
3) Font display
This function checks if all texts have the 'font-display' property set to 'block' or 'swap'. Texts with fonts downloaded on the fly won't be shown until a user will be able to see them.

Features under development:
1) Lazy-loading
2) Video form format control 
3) Image size verification
4) Image number verification
5) Icon recommendation
6) Autoplay control
7) Automatic downloading control 
8) Color choice
9) Budgeting 
10) Open-source libraries usage validation 
11) Personalized CI/CD raports
12) Fix
13) System fonts or hosted fonts feature
14) React rules
15) Typescript rules 

## How to start contributing

If you wish to contribute, just write to us at ec0lint@tutanota.com and start coding!

Refer to [ESLint Developer Guide](https://eslint.org/docs/developer-guide/contributing/)

Thank you!

We are open to collaboration on improving ec0lint, and we are very grateful for all contributions and feedback on the tool. Thank you for creating sustainable digital environment with us!
