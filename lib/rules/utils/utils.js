'use strict';

// Methods which always return something else than a jQuery collection
const nonCollectionReturningMethods = ['get', 'hasClass', 'index', 'is', 'position', 'promise', 'serialize', 'serializeArray', 'toArray', 'triggerHandler'];
// Methods that return something else than a jQuery collection when called without arguments
const nonCollectionReturningAccessors = ['height', 'html', 'innerHeight', 'innerWidth', 'offset', 'scrollLeft', 'scrollTop', 'text', 'val', 'width'];
// Methods that return something else than a jQuery collection when called with a single argument
const nonCollectionReturningValueAccessors = ['attr', 'css', 'data', 'prop'];

const allKnownMethods = require('./all-methods.js');

function isFunction(node) {
    return node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
}

function traverse(context, node, variableTest, constructorTest) {
    const collectionReturningPlugins = context.settings && context.settings['no-jquery'] && context.settings['no-jquery'].collectionReturningPlugins || {};
    while (node) {
        switch (node.type) {
            case 'CallExpression':
                if (node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier') {
                    const name = node.callee.property.name;

                    if (constructorTest(node.callee.object)) {
                        // Utilities never return collections
                        return false;
                    } else {
                        if (
                            nonCollectionReturningMethods.includes(name) ||
                            collectionReturningPlugins[name] === 'never'
                        ) {
                            // e.g. $foo.toArray()
                            return false;
                        }

                        if (
                            (
                                nonCollectionReturningAccessors.includes(name) ||
                                collectionReturningPlugins[name] === 'accessor'
                            ) &&
                            node.arguments.length === 0
                        ) {
                            // e.g. $foo.val()
                            return false;
                        }

                        if (
                            (
                                nonCollectionReturningValueAccessors.includes(name) ||
                                collectionReturningPlugins[name] === 'valueAccessor'
                            ) &&
                            (
                                node.arguments.length === 0 || (
                                    node.arguments.length === 1 &&
                                    node.arguments[0].type !== 'ObjectExpression'
                                )
                            )
                        ) {
                            // Key-value getter-setters may not return a collection if
                            //  - no arguments are passed, e.g. $foo.data()
                            //  - one argument is passed which isn't a plain object,
                            //    e.g. $foo.data("bar")
                            return false;
                        }

                        if (
                            (name === 'outerWidth' || name === 'outerHeight') && (
                                node.arguments.length === 0 || (
                                    node.arguments.length === 1 && !(
                                        node.arguments[0].type === 'Literal' &&
                                        typeof node.arguments[0].value === 'number'
                                    ) && !isFunction(node.arguments[0])
                                )
                            )
                        ) {
                            // .outerWidth/outerHeight may not return a collection if
                            //  - no arguments are passed, e.g. $foo.outerWidth()
                            //  - one argument is passed which isn't a number or function,
                            //    e.g. $foo.outerWidth(true)
                            return false;
                        }

                        if (
                            name === 'queue' && (
                                node.arguments.length === 0 || (
                                    node.arguments.length === 1 &&
                                    node.arguments[0].type === 'Literal' &&
                                    typeof node.arguments[0].value === 'string'
                                )
                            )
                        ) {
                            // .queue may not return a collection if
                            //  - no arguments are passed, e.g. $foo.queue()
                            //  - one argument is passed which is a string,
                            //    e.g. $foo.queue('fx')
                            return false;
                        }

                        if (
                            !allKnownMethods.includes(name) &&
                            !(name in collectionReturningPlugins)
                        ) {
                            // The method is not core jQuery, so we don't know if it returns
                            // a collection or not. Assume it doesn't so we don't get false
                            // positives
                            // e.g. $foo.getMyPluginValue(), returns false
                            return false;
                        }
                    }
                }

                node = node.callee;

                break;
            case 'MemberExpression':
                if (node.property && !(node.parent.type === 'CallExpression' && node.parent.callee === node)) {
                    if (node.property.type === 'Identifier') {
                        if (node.computed) {
                            // e.g. foo[bar] can't be determined, returns false
                            return false;
                        }
                        // e.g. $foo in this.$foo.bar(), returns true
                        // or foo in $this.foo.bar(), returns false
                        return variableTest(node.property);
                    }
                    if (node.property.type === 'Literal') {
                        // e.g. 0 in $foo[0].bar()
                        // or 'prop' in $foo['prop'].bar()
                        return false;
                    }
                }
                node = node.object;
                break;
            case 'Identifier':
                if (node.parent && node.parent.type === 'CallExpression' && node.parent.callee === node) {
                    return constructorTest(node);
                } else {
                    return variableTest(node) || constructorTest(node);
                }
            default:
                return false;
        }
    }
    /* istanbul ignore next */
    throw new Error('Invalid node');
}

function isjQueryConstructor(context, name) {
    const constructorAliases =
        (context.settings && context.settings['no-jquery'] && context.settings['no-jquery'].constructorAliases) ||
        ['$', 'jQuery'];
    return constructorAliases.includes(name);
}

// Traverses from a node up to its root parent to determine if it
// originated from a jQuery `$()` function.
//
// node - The CallExpression node to start the traversal.
//
// Examples
//
//   Returns true for:
//     $('div').find('p').focus()
//     $div.find('p').focus()
//     this.$div.find('p').focus()
//     $.each()
//
//   Returns false for:
//     div.focus()
//     $div[0].focus()
//     $div.remove.bind()
//     $method('foo').focus()
//
// Returns true if the function call node is attached to a jQuery element set.
function isjQuery(context, node) {
    const variablePattern = new RegExp(
        (context.settings && context.settings['no-jquery'] && context.settings['no-jquery'].variablePattern) ||
        '^\\$.'
    );
    return traverse(
        context,
        node,
        // variableTest
        (id) => !!id && variablePattern.test(id.name),
        // constructorTest
        (id) => !!id && isjQueryConstructor(context, id.name)
    );
}

/**
 * Create an linting rule
 *
 * @param {Function} create Create function
 * @param {string} description Description
 * @param {string} [fixable] Fixable mode, e.g. 'code'
 * @param {string[]|boolean} [deprecated] Rule is deprecated.
 *  If a string list, the replacedBy rules.
 * @param {Array} schema Schema
 * @return {Object} Rule
 */
function createRule(create, description, fixable, deprecated, schema) {
    return {
        meta: {
            type: 'suggestion',
            docs: {
                description: description,
                deprecated: !!deprecated,
                replacedBy: Array.isArray(deprecated) ? deprecated : undefined
            },
            fixable: fixable,
            schema: schema || []
        },
        create: create
    };
}

function messageSuffix(message) {
    let messageString;
    if (typeof message === 'string') {
        messageString = message;
    } else if (typeof message === 'function') {
        messageString = message(true);
    }
    // The rule name should already exist in the first half of the description
    // so avoid repeating it. It is required in the message as that is shown
    // on its own in error reports.
    return messageString ? ' ' + messageString.replace(/(Prefer .*) to .*$/, '$1') + '.' : '';
}

function messageToPlainString(message, node, name, options) {
    let messageString = (
        typeof message === 'function' ?
            message(node) :
            message || ''
    ).replace(/`/g, '');

    if (!messageString) {
        /* istanbul ignore next */
        // Fallback messages, not a problem if they become unused
        switch (options.mode) {
            case 'collection':
                messageString = '.' + name + ' is not allowed';
                break;
            case 'util':
                messageString = '$.' + name + ' is not allowed';
                break;
            case 'collection-util':
                messageString = '.' + name + '/$.' + name + ' is not allowed';
                break;
        }
    }

    if (options.deprecated) {
        messageString += '. This rule is deprecated';
        if (Array.isArray(options.deprecated)) {
            messageString += ', use ' + options.deprecated.join(', ');
        }
        messageString += '.';
    }

    return messageString;
}

function jQueryCollectionLink(name) {
    switch (name) {
        case 'hasData':
            // See tests/rules/no-data.js
            return '`.' + name + '`';
        default:
            return '[`.' + name + '`](https://api.jquery.com/' + name + '/)';
    }
}

function jQueryGlobalLink(name) {
    switch (name) {
        case 'attr':
        case 'camelCase':
        case 'clone':
        case 'css':
        case 'filter':
        case 'find':
        case 'prop':
        case 'text':
            // Undocumented methods
            return '`$.' + name + '`';
        default:
            return '[`$.' + name + '`](https://api.jquery.com/jQuery.' + name + '/)';
    }
}

/**
 * Create a rule for collection methods
 *
 * @param {string|string[]} methods Method or list of method names
 * @param {string|Function} [message] Message to report. String or function that is passed
 *  the target node, or true to generate context-agnostic message (for documentation).
 * @param {Object} [options] Options
 * @param {string} [options.fixable] Fixable mode, e.g. 'code'
 * @param {Function} [options.fix] Fixing function. First argument is `node`.
 * @param {string[]|boolean} [options.deprecated] Rule is deprecated.
 *  If a string list, the replacedBy rules.
 * @param {boolean} [options.getAndSetOptions] Create options to enabled getting and setting
 *  separately.
 * @return {Object} Rule
 */
function createCollectionMethodRule(methods, message, options) {
    options = options || {};

    options.mode = 'collection';

    methods = Array.isArray(methods) ? methods : [methods];

    let description = 'Disallows the ' + methods.map(jQueryCollectionLink).join('/') + ' ' +
        (methods.length > 1 ? 'methods' : 'method') + '.';

    description += messageSuffix(message);

    let schema = [];
    if (options.getAndSetOptions) {
        schema = [
            {
                type: 'object',
                properties: {
                    allowGetOrSet: {
                        enum: ['none', 'get', 'set']
                    }
                },
                additionalProperties: false
            }
        ];

        // TODO: nonCollectionReturningValueAccessors have 1 argument in getter mode
        description += '\n\nUsing this method only as a getter or a setter can be allowed using the `allowGetOrSet` option:\n' +
            '* `"none"` (default) the method can\'t be used at all\n' +
            '* `"get"` the method can only be used as a getter i.e. with no arguments\n' +
            '* `"set"` the method can only be used as a setter i.e. with arguments';
    }

    return createRule(function (context) {
        return {
            'CallExpression:exit': function (node) {
                if (node.callee.type !== 'MemberExpression') {
                    return;
                }
                const name = node.callee.property.name;
                if (
                    !methods.includes(name) ||
                    isjQueryConstructor(context, node.callee.object.name)
                ) {
                    return;
                }
                const allowGetOrSet = (context.options[0] && context.options[0].allowGetOrSet) || 'none';
                // TODO: nonCollectionReturningValueAccessors have 1 argument in getter mode
                if (
                    (allowGetOrSet === 'get' && !node.arguments.length) ||
                    (allowGetOrSet === 'set' && node.arguments.length)
                ) {
                    return;
                }

                if (isjQuery(context, node.callee)) {
                    context.report({
                        node: node,
                        message: messageToPlainString(message, node, name, options),
                        fix: options.fix && options.fix.bind(this, node, context)
                    });
                }
            }
        };
    }, description, options.fixable, options.deprecated, schema);
}

/**
 * Create a rule for collection property
 *
 * @param {string} property Property name
 * @param {string|Function} [message] Message to report. See createCollectionMethodRule.
 * @param {Object} [options] Options. See createCollectionMethodRule.
 * @return {Object} Rule
 */
function createCollectionPropertyRule(property, message, options) {
    options = options || {};

    options.mode = 'collection';

    let description = 'Disallows the ' + jQueryCollectionLink(property) + ' property.';

    description += messageSuffix(message);

    return createRule(function (context) {
        return {
            'MemberExpression:exit': function (node) {
                const name = node.property.name;
                if (
                    name !== property ||
                    node.parent.callee === node
                ) {
                    return;
                }
                if (isjQuery(context, node.object)) {
                    context.report({
                        node: node,
                        message: messageToPlainString(message, node, name, options),
                        fix: options.fix && options.fix.bind(this, node, context)
                    });
                }
            }
        };
    }, description, options.fixable, options.deprecated);
}

/**
 * Create a rule for util methods
 *
 * @param {string|string[]} methods Method or list of method names
 * @param {string|Function} [message] Message to report. See createCollectionMethodRule.
 * @param {Object} [options] Options. See createCollectionMethodRule.
 * @return {Object} Rule
 */
function createUtilMethodRule(methods, message, options) {
    options = options || {};

    options.mode = 'util';

    methods = Array.isArray(methods) ? methods : [methods];

    let description = 'Disallows the ' + methods.map(jQueryGlobalLink).join('/') + ' ' +
        (methods.length > 1 ? 'utilies' : 'utility') + '.';

    description += messageSuffix(message);

    return createRule(function (context) {
        return {
            'CallExpression:exit': function (node) {
                if (node.callee.type !== 'MemberExpression') {
                    return;
                }
                const name = node.callee.property.name;
                if (
                    !methods.includes(name) ||
                    !isjQueryConstructor(context, node.callee.object.name)
                ) {
                    return;
                }

                context.report({
                    node: node,
                    message: messageToPlainString(message, node, name, options),
                    fix: options.fix && options.fix.bind(this, node, context)
                });
            }
        };
    }, description, options.fixable, options.deprecated);
}

/**
 * Create a rule for util methods
 *
 * @param {string} property Property name
 * @param {string|Function} [message] Message to report. See createCollectionMethodRule.
 * @param {Object} [options] Options. See createCollectionMethodRule.
 * @return {Object} Rule
 */
function createUtilPropertyRule(property, message, options) {
    options = options || {};

    options.mode = 'util';

    let description = 'Disallows the ' + jQueryGlobalLink(property) + ' property.';

    description += messageSuffix(message);

    return createRule(function (context) {
        return {
            'MemberExpression:exit': function (node) {
                if (!isjQueryConstructor(context, node.object.name)) {
                    return;
                }
                const name = node.property.name;
                if (name !== property) {
                    return;
                }

                context.report({
                    node: node,
                    message: messageToPlainString(message, node, name, options),
                    fix: options.fix && options.fix.bind(this, node, context)
                });
            }
        };
    }, description, options.fixable, options.deprecated);
}

/**
 * Create a rule for methods with the same name in a util and collection
 *
 * @param {string|string[]} methods Method or list of method names
 * @param {string|Function} [message] Message to report. See createCollectionMethodRule.
 * @param {Object} [options] Options. See createCollectionMethodRule.
 * @return {Object} Rule
 */
function createCollectionOrUtilMethodRule(methods, message, options) {
    options = options || {};

    options.mode = 'collection-util';

    methods = Array.isArray(methods) ? methods : [methods];

    let description = 'Disallows the ' + methods.map(jQueryCollectionLink).join('/') + ' ' +
        (methods.length > 1 ? 'methods' : 'method');

    description += ' and ' + methods.map(jQueryGlobalLink).join('/') + ' ' +
        (methods.length > 1 ? 'utilies' : 'utility') + '.';

    description += messageSuffix(message);

    return createRule(function (context) {
        return {
            'CallExpression:exit': function (node) {
                if (node.callee.type !== 'MemberExpression') {
                    return;
                }
                const name = node.callee.property.name;
                if (!methods.includes(name)) {
                    return;
                }
                if (isjQuery(context, node.callee)) {
                    context.report({
                        node: node,
                        message: messageToPlainString(message, node, name, options),
                        fix: options.fix && options.fix.bind(this, node, context)
                    });
                }
            }
        };
    }, description, options.fixable, options.deprecated);
}

function eventShorthandFixer(node, context, fixer) {
    const name = node.callee.property.name;
    if (node.callee.parent.arguments.length) {
        return [
            fixer.replaceText(node.callee.property, 'on'),
            fixer.insertTextBefore(node.callee.parent.arguments[0], JSON.stringify(name) + ', ')
        ];
    } else {
        return [
            fixer.replaceText(node.callee.property, 'trigger'),
            fixer.insertTextBeforeRange([node.range[1] - 1], JSON.stringify(name))
        ];
    }
}

module.exports = {
    isjQuery: isjQuery,
    isjQueryConstructor: isjQueryConstructor,
    isFunction: isFunction,
    createCollectionMethodRule: createCollectionMethodRule,
    createCollectionPropertyRule: createCollectionPropertyRule,
    createUtilMethodRule: createUtilMethodRule,
    createUtilPropertyRule: createUtilPropertyRule,
    createCollectionOrUtilMethodRule: createCollectionOrUtilMethodRule,
    eventShorthandFixer: eventShorthandFixer,
    jQueryCollectionLink: jQueryCollectionLink,
    jQueryGlobalLink: jQueryGlobalLink
};