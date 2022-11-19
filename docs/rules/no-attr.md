# no-attr

Disallows the [`.attr`](https://api.jquery.com/attr/)/[`.removeAttr`](https://api.jquery.com/removeAttr/) methods and `$.attr`/[`$.removeAttr`](https://api.jquery.com/jQuery.removeAttr/) utilies. Prefer `Element#getAttribute`/`setAttribute`/`removeAttribute`.

## Rule details

❌ Examples of **incorrect** code:
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

✔️ Examples of **correct** code:
```js
attr();
[].attr();
div.attr();
div.attr;
removeAttr();
div.removeAttr;
```
