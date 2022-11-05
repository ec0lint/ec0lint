# no-ajax-events

Disallows to use global ajax events handlers: [`.ajaxComplete`](https://api.jquery.com/ajaxComplete/)/[`.ajaxError`](https://api.jquery.com/ajaxError/)/[`.ajaxSend`](https://api.jquery.com/ajaxSend/)/[`.ajaxStart`](https://api.jquery.com/ajaxStart/)/[`.ajaxStop`](https://api.jquery.com/ajaxStop/)/[`.ajaxSuccess`](https://api.jquery.com/ajaxSuccess/). We recommend to use local events if needed.

## CO2 reduction

Using global events causes an increase in requests to the HTTP server. Global events make queries per each ajax call. Replacing these events with local ones will significantly reduce the number of requests to the server. The amount of CO2 produced varies with the amount of data transferred, on average it is **0.35g / MB**

## Examples

Examples of **incorrect** code:
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

Examples of **correct** code:
```js
$( document ).on( 'click', function ( e ) { } );
$form.on( 'submit', function ( e ) { } );
$form.on();
on( 'ajaxSuccess', '.js-select-menu', function ( e ) { } );
form.on( 'ajaxSend' );
form.ajaxSend();
$.ajaxSend();
```