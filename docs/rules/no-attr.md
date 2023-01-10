# no-attr

Disallows the `.attr`/`.removeAttr` methods and `$.attr`/`$.removeAttr` utilies.  We recommend using `Element#getAttribute`/`setAttribute`/`removeAttribute`.

## CO2 reduction

By using this rule in your project, you can reduce the carbon footprint even up to 0.46 g per website view if you decide to remove the jQuery library. 

By multiplying the library size by the end-user traffic (0.81 kWh / 1000 MB) and by the energy emissions (442 g/kWh), the carbon footprint of this library can be calculated. 

## Rule details

The following pattern is considered a problem:
```js
$.attr();
$( 'div' ).attr();
$div.attr();
$( 'div' ).first().attr();
$( 'div' ).append( $( 'input' ).attr() );
$( 'div' ).attr( 'name' );
$( 'div' ).attr( 'name', 'random' );
$.removeAttr();
$( 'div' ).removeAttr( 'name' );
```

The following pattern is not considered as a problem:
```js
el.getAttribute('tabindex');
el.removeAttribute('tabindex');
el.setAttribute('tabindex', 3);
```
