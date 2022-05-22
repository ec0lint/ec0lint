"use strict";

module.exports = function(it) {
    const { directoryPath } = it;

    return `
ec0lint couldn't find a configuration file. To set up a configuration file for this project, please run:

    npm init @ec0lint/config

ec0lint looked for configuration files in ${directoryPath} and its ancestors. If it found none, it then looked in your home directory.

`.trimLeft();
};
