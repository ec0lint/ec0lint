# no-ajax

Disallows the [`$.ajax`](https://api.jquery.com/jQuery.ajax/)/[`$.get`](https://api.jquery.com/jQuery.get/)/[`$.getJSON`](https://api.jquery.com/jQuery.getJSON/)/[`$.getScript`](https://api.jquery.com/jQuery.getScript/)/[`$.post`](https://api.jquery.com/jQuery.post/) utilies. We recommend using `Window.fetch`.

Fetch API is the new standard to replace XMLHttpRequest to do what ajax does. It works on Chrome and Firefox, you can use polyfills to make it work on legacy browsers. 

Try github/fetch on IE9+ or fetch-ie8 on IE8+, fetch-jsonp to make JSONP requests. 

## CO2 reduction

By using this rule in your project, you can reduce the carbon footprint even up to 0.46 g per website view if you decide to remove the jQuery library. 

By multiplying the library size by the end-user traffic (0.81 kWh / 1024 MB) and by the energy emissions (442 g/kWh), the carbon footprint of this library can be calculated. 

## Rule details

The following patterns are considered problems: 
```js
$.ajax({ 
  type: 'POST', 
  url: '/my/url', 
  data: data 
}); 
```

```js
$.ajax({ 
  type: 'GET', 
  url: '/my/url', 
  success: function (resp) {}, 
  error: function () {} 
}); 
```

The following patterns are not considered problems: 
```js
await fetch('/my/url', { 
  method: 'POST', 
  headers: { 
    'Content-Type': 'application/json' 
  }, 
  body: JSON.stringify(data) 
}); 
```
```js
const response = await fetch('/my/url'); 
 
if (!response.ok) { 
} 
 
const body = await response.text(); 
```