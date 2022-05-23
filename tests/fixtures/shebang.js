#!/usr/bin/env node
/*ec0lint no-process-exit:0*/

var cli = require("../lib/cli");
var exitCode = cli.execute(Array.prototype.slice.call(process.argv, 2));
process.exit(exitCode);
