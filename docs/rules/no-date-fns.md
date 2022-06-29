# no-date-fns

Disallows to use *date-fns*. 

It’s a great library, but in most cases can be replaced by plain javascript. 

By using this rule in your project, you can reduce the carbon footprint even up to **2.26 g per website view** after removing the redundant library. By multiplying the library size by the end-user traffic (0.81 kWh / 1000 MB) and by the energy emissions (442 g/kWh), the carbon footprint of a library can be calculated.

| Name        | Size      | CO2 reduction |
| ----------- | --------- | ------------- |
| date-fns    | 6.47MB    | 2.26g         |

The library sizes were checked at https://www.npmjs.com/package    
For more examples how to replace date-fns with plain javascript go here: https://youmightnotneed.com/date-fns

## Examples 

The following patterns are considered problems:  

```js
/*ec0lint no-date-fns: "error"*/  
  
const date_fns = require(‘date-fns’)
```

```js
/*ec0lint no-date-fns: "error"*/  
  
import date_fns from ‘date-fns’ 
```

```js
/*ec0lint no-date-fns: "error"*/  
  
const closestIndexTo = require('date-fns/closestIndexTo') 
const dateToCompare = new Date(2015, 8, 6) 
const datesArray = [ 
  new Date(2015, 0, 1), 
  new Date(2016, 0, 1), 
  new Date(2017, 0, 1), 
] 

closestIndexTo(dateToCompare, datesArray) 
```

The following pattern is not considered as a problem:  

```js
/*ec0lint no-date-fns: "error"*/  

const closestIndexTo = (dateToCompare, datesArray) => { 
  const distances = datesArray.map(date => Math.abs(date - dateToCompare)) 

  return distances.indexOf(Math.min(...distances)) 
} 

const dateToCompare = new Date(2015, 8, 6) 
const datesArray = [ 
  new Date(2015, 0, 1), 
  new Date(2016, 0, 1), 
  new Date(2017, 0, 1), 
] 

closestIndexTo(dateToCompare, datesArray)
```