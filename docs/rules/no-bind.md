# no-bind

Disallows the [`.bind`](https://api.jquery.com/bind/)/[`.unbind`](https://api.jquery.com/unbind/) methods. Prefer `.on`/`.off` or `EventTarget#addEventListener`/`removeEventListener`.

📋 This rule is enabled in `plugin:no-jquery/deprecated-3.0`.

📋 This rule is enabled in `plugin:no-jquery/all`.

## Rule details

❌ Examples of **incorrect** code:
```js
$( 'div' ).bind();
$div.bind();
$( 'div' ).first().bind();
$( 'div' ).append( $( 'input' ).bind() );
$( 'div' ).unbind();
$div.unbind();
$( 'div' ).first().unbind();
$( 'div' ).append( $( 'input' ).unbind() );
```

✔️ Examples of **correct** code:
```js
bind();
[].bind();
div.bind();
div.bind;
$div.remove.bind( $div );
unbind();
[].unbind();
div.unbind();
div.unbind;
$div.remove.unbind( $div );
