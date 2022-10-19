# lighter-http 

Disallows to use libraries like: *axios, got, request, make-fetch-happen, superagent, needle, simple-get*. 

Importing large sets of packages, which are doing exactly the same work as fetch, takes a large amount of disk space. Fetch API is a built-in functionality, so it’s always on hand. We recommend using fetch.  

## CO2 reduction 

By using this rule in your project, you can reduce the carbon footprint even up to **0.21 g per website view** after removing a redundant library.  

By multiplying the library size by the end-user traffic (0.81 kWh / 1000 MB) and by the energy emissions (442 g/kWh), the carbon footprint of a library can be calculated.

| Name                | Size      | CO2 reduction |
| ------------------- | --------- | ------------- |
| simple-get          | 0.01MB    | 0.003g        | 
| make-fetch-happnen  | 0.06MB    | 0.02g         | 
| request             | 0.2MB     | 0.07g         | 
| got                 | 0.24MB    | 0.08g         | 
| needle              | 0.26MB    | 0.09g         | 
| axios               | 0.44MB    | 0.16g         | 
| superagent          | 0.58MB    | 0.21g         | 

The library sizes were checked at www.npmjs.com/package. 
For more examples how to replace axios or other http library with plain javascript go here: https://danlevy.net/you-may-not-need-axios/

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
