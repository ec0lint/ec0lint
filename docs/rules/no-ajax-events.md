# no-ajax-events

Disallows global ajax events handlers: [`.ajaxComplete`](https://api.jquery.com/ajaxComplete/)/[`.ajaxError`](https://api.jquery.com/ajaxError/)/[`.ajaxSend`](https://api.jquery.com/ajaxSend/)/[`.ajaxStart`](https://api.jquery.com/ajaxStart/)/[`.ajaxStop`](https://api.jquery.com/ajaxStop/)/[`.ajaxSuccess`](https://api.jquery.com/ajaxSuccess/). Prefer local events.


## Rule details

❌ Examples of **incorrect** code:
```js
$( document ).on( 'ajaxSend', function ( e ) { } );
$( document ).on( 'ajaxSuccess', function ( e ) { } );
$form.on( 'ajaxError', function ( e ) { } );
$form.on( 'ajaxComplete', function ( e ) { } );
$form.on( 'ajaxStart', function ( e ) { } );
$form.on( 'ajaxStop', function ( e ) { } );
$( document ).ajaxSend( function ( e ) { } );
$( document ).ajaxSuccess( function ( e ) { } );
$form.ajaxError( function ( e ) { } );
$form.ajaxComplete( function ( e ) { } );
$form.ajaxStart( function ( e ) { } );
$form.ajaxStop( function ( e ) { } );
```

✔️ Examples of **correct** code:
```js
$( document ).on( 'click', function ( e ) { } );
$form.on( 'submit', function ( e ) { } );
$form.on();
on( 'ajaxSuccess', '.js-select-menu', function ( e ) { } );
form.on( 'ajaxSend' );
form.ajaxSend();
$.ajaxSend();
```

## Resources

* [Rule source](/src/rules/no-ajax-events.js)
* [Test source](/tests/rules/no-ajax-events.js)