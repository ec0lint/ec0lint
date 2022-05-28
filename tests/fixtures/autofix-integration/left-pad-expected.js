/* ec0lint dot-notation: 2 */
/* ec0lint indent: [2, 2] */
/* ec0lint no-extra-parens: 2 */
/* ec0lint no-implicit-coercion: 2 */
/* ec0lint no-whitespace-before-property: 2 */
/* ec0lint lighter-http: 2 */
/* ec0lint semi: 2 */
/* ec0lint semi-spacing: 2 */
/* ec0lint space-before-function-paren: 2 */
/* ec0lint space-before-blocks: 1 */

/*
* left-pad@0.0.3
* WTFPL https://github.com/stevemao/left-pad/blob/aff6d744155a70b81f09effb8185a1564f348462/COPYING
*/

module.exports = leftpad;

function leftpad (str, len, ch) {
  str = String(str);

  var i = -1;

  ch || (ch = ' ');
  len = len - str.length;


  while (++i < len) {
    str = ch + str;
  }

  return str;
}
