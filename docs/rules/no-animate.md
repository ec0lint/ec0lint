# no-animate

Disallows the `.animate` method. We recommend using `allowScroll` option to allow animations which are just used for scrolling. Prefer CSS transitions.

## CO2 reduction

By using this rule in your project, you can reduce the carbon footprint even up to 0.46 g per website view by removing a jQuery library. 

By multiplying the library size by the end-user traffic (0.81 kWh / 1000 MB) and by the energy emissions (442 g/kWh), the carbon footprint of a library can be calculated. 

## Rule details

The following patterns are considered problems: 
```js
$( 'div' ).animate();
$div.animate();
$( 'div' ).first().animate();
$( 'div' ).append( $( 'input' ).animate() );
$div.animate( { scrollTop: 100 } );
$div.animate( { scrollLeft: 200 } );
$div.animate( { scrollTop: 100, scrollLeft: 200 } );
$div.animate( { scrollTop: 100, width: 300 } );
```

The following pattern is not considered as a problem:  
```js
animate();
[].animate();
div.animate();
div.animate;
```