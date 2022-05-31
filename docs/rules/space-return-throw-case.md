# space-return-throw-case

Requires spaces after `return`, `throw`, and `case` keywords.

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#--fix) automatically fixed problems reported by this rule.

Require spaces following `return`, `throw`, and `case`.

## Rule Details

Examples of **incorrect** code for this rule:

```js
/*eslint space-return-throw-case: "error"*/

throw{a:0}

function f(){ return-a; }

switch(a){ case'a': break; }
```

Examples of **correct** code for this rule:

```js
/*eslint space-return-throw-case: "error"*/

throw {a: 0};

function f(){ return -a; }

switch(a){ case 'a': break; }
```
