# no-box-model
Disallows using jQuery property ```$.boxModel```.  We recommend using logical check in plain Javascript build in property ```document.compatMode === “CSS1Compat”```. 

**Packages:** ec0lint

## CO2 reduction

By using this rule in your project, you can reduce the carbon footprint even up to 0.46 g per website view if you decide to remove the jQuery library.  

By multiplying the library size by the end-user traffic (0.81 kWh / 1024 MB) and by the energy emissions (442 g/kWh), the carbon footprint of this library can be calculated.  

### Examples

The following patterns are considered problems: 

 ```js
    $.boxModel;
```

```js
    $.boxModel.style; 
```

The following pattern is not considered problem: 

```js
    const check = document.compatMode === "CSS1Compat"; 
```

