# lighter-http

Disallows to use libraries like: axios, got, request, make-fetch-happen, superagent, needle, simple-get.

Importing large sets of packages, which are doing exactly same work like fetch, takes large amount of disk space.
Fetch API is build-in functionality, so it's always hereabouts.

## CO2 reduction

The weight of each of the libraries:
* axios:
* got:
* request:
* make-fetch-happen:
* superagent:
* needle:
* simple-get:

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

## When Not To Use It

If you will by default use fetch to http requests.
