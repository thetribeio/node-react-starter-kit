#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

let directory = process.cwd();

const { root } = path.parse(directory);

while (!fs.existsSync(`${directory}/package.json`)) {
    if (directory === root) {
        process.exit(2);
    }

    directory = path.dirname(directory);
}

// eslint-disable-next-line global-require, import/no-dynamic-require
process.exit(process.argv[2] in require(`${directory}/package.json`).scripts ? 0 : 1);
