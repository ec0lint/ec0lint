## no-browser

Disallows the .browser method and $.browser utility. We recommend using Navigator object which can be retrieved using the read-only window.navigator property.

## CO2 reduction

By using this rule in your project, you can reduce the carbon footprint even up to 0.46 g per website view if you decide to remove the jQuery library.

By multiplying the library size by the end-user traffic (0.81 kWh / 1024 MB) and by the energy emissions (442 g/kWh), the carbon footprint of this library can be calculated.

## Rule details

The following patterns is considered a problem:


(a)
```js
$("p").html("The version # of the browser's rendering engine is: <span>" + $.browser.version + "</span>");

```

(b)

```js
if ($.browser.msie) {alert($.browser.version);}
```

(c)

```js
jQuery.each( jQuery.browser, function( i, val ) {
    $("<div>" + i + ": <span>" + val + "</span>")
        .appendTo( document.body);
});
```

The following pattern is not considered as a problem:

(a)

```js
const browserName = getBrowserName(navigator.userAgent);
```
