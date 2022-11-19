# no-animate

Disallows the [`.animate`](https://api.jquery.com/animate/) method. Use the `allowScroll` option to allow animations which are just used for scrolling. Prefer CSS transitions.

## Rule details

❌ Examples of **incorrect** code:
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

✔️ Examples of **correct** code:
```js
animate();
[].animate();
div.animate();
div.animate;
```

❌ Examples of **incorrect** code with `[{"allowScroll":false}]` options:
```js
$div.animate( { scrollTop: 100 } );
```

❌ Examples of **incorrect** code with `[{"allowScroll":true}]` options:
```js
$div.animate();
$div.animate( { scrollTop: 100, width: 300 } );
```

✔️ Examples of **correct** code with `[{"allowScroll":true}]` options:
```js
$div.animate( { scrollTop: 100 } );
$div.animate( { scrollLeft: 200 } );
$div.animate( { scrollTop: 100, scrollLeft: 200 } );
```