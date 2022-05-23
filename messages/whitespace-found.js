"use strict";

module.exports = function(it) {
    const { pluginName } = it;

    return `
ec0lint couldn't find the plugin "${pluginName}". because there is whitespace in the name. Please check your configuration and remove all whitespace from the plugin name.

`.trimLeft();
};
