# no-ajax

Disallows the [`$.ajax`](https://api.jquery.com/jQuery.ajax/)/[`$.get`](https://api.jquery.com/jQuery.get/)/[`$.getJSON`](https://api.jquery.com/jQuery.getJSON/)/[`$.getScript`](https://api.jquery.com/jQuery.getScript/)/[`$.post`](https://api.jquery.com/jQuery.post/) utilies. We recommend to use `Window.fetch`.

Fetch API is the new standard to replace XMLHttpRequest to do ajax. It works on Chrome and Firefox, you can use polyfills to make it work on legacy browsers.

Try github/fetch on IE9+ or fetch-ie8 on IE8+, fetch-jsonp to make JSONP requests.

## CO2 reduction

By using this rule in your project, you can reduce the carbon footprint even up to **0.46 g per website view** after removing a jQuery at all.  

By multiplying the library size by the end-user traffic (0.81 kWh / 1000 MB) and by the energy emissions (442 g/kWh), the carbon footprint of a library can be calculated.

## Rule details

Examples of **incorrect** code:
```js
$.ajax();
$.get();
$.getJSON();
$.getScript();
$.post();
```

Examples of **correct** code:
```js
ajax();
div.ajax();
div.ajax;
get();
div.get();
div.get;
getJSON();
div.getJSON();
div.getJSON;
getScript();
div.getScript();
div.getScript;
post();
div.post();
div.post;
```