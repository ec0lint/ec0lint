# no-moment-js

Disallows to use *moment-js*. 

It’s a great library, but in most cases can be replaced by plain javascript. If you are working on a performance sensitive web application, using moment-js might cause a huge performance overhead because of its complex APIs and large bundle size. Plain javascript is much *greener* than moment-js. 

By using this rule in your project, you can reduce the carbon footprint even up to **1.48 g per website view** after removing the redundant library. By multiplying the library size by the end-user traffic (0.81 kWh / 1000 MB) and by the energy emissions (442 g/kWh), the carbon footprint of a library can be calculated.  

| Name        | Size      | CO2 reduction |
| ----------- | --------- | ------------- |
| moment-js   | 4.23MB    | 1.48g         | 

The library sizes were checked at https://www.npmjs.com/package    
For more examples how to replace moment-js with plain javascript go here: https://github.com/you-dont-need/You-Dont-Need-Momentjs

## Examples 

The following patterns are considered problems:  

```js
/*ec0lint no-moment-js: "error"*/  
  
const moment = require(‘moment-js’)  
```

```js
/*ec0lint no-moment-js: "error"*/  
  
import moment from ‘no-moment-js’ 
```

```js
/*ec0lint no-moment-js: "error"*/  
  
import moment from ‘moment-js’ 

moment('12-25-1995', 'MM-DD-YYYY'); 
```

The following pattern is not considered as a problem:  

```js
/*ec0lint no-moment-js: "error"*/  
const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/; 
const [, month, day, year] = datePattern.exec('12-25-1995'); 

new Date(`${month}, ${day} ${year}`); 
```