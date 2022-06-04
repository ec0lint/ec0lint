# no-wrap-func

Disallows unnecessary parentheses around function expressions.

Although it's possible to wrap functions in parentheses, this can be confusing when the code also contains immediately-invoked function expressions (IIFEs) since parentheses are often used to make this distinction. For example:

```js
var foo = (function() {
    // IIFE
}());

var bar = (function() {
    // not an IIFE
});
```

## Rule Details

This rule will raise a warning when it encounters a function expression wrapped in parentheses with no following invoking parentheses.

Example of **incorrect** code for this rule:

```js
var a = (function() {/*...*/});
```

Examples of **correct** code for this rule:

```js
var a = function() {/*...*/};

(function() {/*...*/})();
```
