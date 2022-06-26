# lighter-http 

Disallows to use libraries like: *axios, got, request, make-fetch-happen, superagent, needle, simple-get*. 

Importing large sets of packages, which are doing exactly the same work as fetch, takes a large amount of disk space. Fetch API is a built-in functionality, so it’s always hereabouts. 

## CO2 reduction 

By using this rule in your project, you can reduce the carbon footprint even up to **0.21 g per website view** after removing a redundant library.  

By multiplying the library size by the end-user traffic (0.81 kWh / 1024 Mb) and by the energy emissions (442 g/kWh), the carbon footprint of the heaviest library – *superagent* (0.58 MB) – sums up to 0.20g. For *axios* (0.44 MB) the carbon footprint amounts to 0.15 g, for *needle* (0.26 MB) - 0.09 g, for *got* (0.24 MB) - 0.08 g, for *request* (0.2 MB) - 0.07 g, for *make-fetch-happen* (0.06 MB) - 0.02 g, and for *simple-get* (0.01 MB) - 0.003 g.  

The library sizes were checked at www.npmjs.com/package. 

## Examples 

Examples of **incorrect** code for this rule: 

```js
/*ec0lint lighter-http: "error"*/

const axios = require('axios')
```

```js
/*ec0lint lighter-http: "error"*/

import axios from 'axios'
```

```js
/*ec0lint lighter-http: "error"*/

import * as axios from 'axios'
```

Examples of **correct** code for this rule:

```js
/*ec0lint lighter-http: "error"*/


fetch('https://api.github.com/orgs/nodejs')
.then(response => response.json())
.then(data => {
  console.log(data) // Prints result from `response.json()` in getRequest
})
.catch(error => console.error(error))
```
