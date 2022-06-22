# avoid-lodash

Disallows to use *lodash*. 

It’s a great library, but in most cases can be replaced by plain javascript. 

By using this rule in your project, you can reduce the carbon footprint even up to **0.5 g per website view** after removing the redundant library. By multiplying the library size by the end-user traffic (0.81 kWh / 1000 MB) and by the energy emissions (442 g/kWh), the carbon footprint of a library can be calculated.  

| Name        | Size      | CO2 reduction |
| ----------- | --------- | ------------- |
| loadash     | 1.41MB    | 0.5g          |    

The library sizes were checked at https://www.npmjs.com/package    
For more examples how to replace lodash with plain javascript go here: https://youmightnotneed.com/lodash

## Examples 

The following patterns are considered problems:  

```js
/*ec0lint avoid-lodash: "error"*/  
  
const lodash = require(lodash)  
```

```js
/*ec0lint avoid-lodash: "error"*/  
  
import lodash from ‘lodash’  
```

```js
/*ec0lint avoid-lodash: "error"*/  
  
import { compact } from 'lodash' 

compact([0, 1, 2]) 
```

The following pattern is not considered as a problem:  

```js
/*ec0lint avoid-lodash: "error"*/  

[0, 1, 2].filter(x => !!x) 
```