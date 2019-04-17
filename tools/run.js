function run(fn, options) {
    const task = 'undefined' === typeof fn.default ? fn : fn.default;

    return task(options);
}

if (require.main === module && process.argv.length > 2) {
    // ensure we do not run on cache
    // eslint-disable-next-line no-underscore-dangle
    delete require.cache[__filename];

    // get the up to date module
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const module = require(`./${process.argv[2]}.js`).default;

    run(module).catch((err) => {
        console.error(err.stack);
        process.exit(1);
    });
}

export default run;
