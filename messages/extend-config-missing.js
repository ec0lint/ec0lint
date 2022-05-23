"use strict";

module.exports = function(it) {
    const { configName, importerName } = it;

    return `
ec0lint couldn't find the config "${configName}" to extend from. Please check that the name of the config is correct.

The config "${configName}" was referenced from the config file in "${importerName}".
`.trimLeft();
};
