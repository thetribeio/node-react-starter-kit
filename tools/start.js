import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import webpackConfig from './webpack.config';
import run from './run';
import clean from './clean';

// https://webpack.js.org/configuration/watch/#watchoptions
const watchOptions = {
    // Watching may not work with NFS and machines in VirtualBox
    // Uncomment next line if it is your case (use true or interval in milliseconds)
    // poll: true,
    // Decrease CPU or memory usage in some file systems
    // ignored: /node_modules/,
};

const createCompilationPromise = (name, compiler, config) => new Promise((resolve, reject) => {
    // listen to webpack hooks (done)
    compiler.hooks.done.tap(name, (stats) => {
        // print out stats
        console.info(stats.toString(config.stats));

        if (stats.hasErrors()) {
            // reject on errors
            reject(new Error('Compilation failed!'));
        } else {
            // resolve on successful builds
            resolve(stats);
        }
    });
});

let server;

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
async function start() {
    if (server) {
        return server;
    }

    // create an express server
    server = express();
    // use the error overlay middleware to provide a better display for errors
    server.use(errorOverlayMiddleware());

    // get the client webpack config
    const clientConfig = webpackConfig.find((config) => 'client' === config.name);

    // add webpackHotDevClient to its entry and ensure the polyfill is first
    clientConfig.entry.client = ['./tools/lib/webpackHotDevClient.js', ...clientConfig.entry.client]
        .sort((a, b) => b.includes('polyfill') - a.includes('polyfill'));

    // use the hash instead of chunkhash
    clientConfig.output.filename = clientConfig.output.filename.replace('chunkhash', 'hash');
    clientConfig.output.chunkFilename = clientConfig.output.chunkFilename.replace('chunkhash', 'hash');
    // remove the null loader (used to nullify the import of react-deep-force-update
    clientConfig.module.rules = clientConfig.module.rules.filter((x) => x.loader !== 'null-loader');
    // then push the HOT plugin
    clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    // get the server webpack config
    const serverConfig = webpackConfig.find((config) => 'server' === config.name);
    // configure the HOT
    serverConfig.output.hotUpdateMainFilename = 'updates/[hash].hot-update.json';
    serverConfig.output.hotUpdateChunkFilename = 'updates/[id].[hash].hot-update.js';
    // remove null loaders (might be critical for SSR)
    serverConfig.module.rules = serverConfig.module.rules.filter((x) => x.loader !== 'null-loader');
    // and finally push the HOT plugin
    serverConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    //  clean the build directory
    await run(clean);

    // instance the main webpack compiler
    const multiCompiler = webpack(webpackConfig);
    // and dissociate from it our client & server compiler
    const clientCompiler = multiCompiler.compilers.find((compiler) => 'client' === compiler.name);
    const serverCompiler = multiCompiler.compilers.find((compiler) => 'server' === compiler.name);

    // create promises on their compilations
    const clientPromise = createCompilationPromise('client', clientCompiler, clientConfig);
    const serverPromise = createCompilationPromise('server', serverCompiler, serverConfig);

    // configure the webpack dev middleware
    // https://github.com/webpack/webpack-dev-middleware
    server.use(webpackDevMiddleware(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        logLevel: 'silent',
        watchOptions,
    }));

    // then configure the webpack hot middleware
    // https://github.com/glenjamin/webpack-hot-middleware
    server.use(webpackHotMiddleware(clientCompiler, { log: false }));

    let appPromise; // promise resolving the server
    let appPromiseResolve; // resolve callback of the same promise
    let appPromiseIsResolved = true; // has the promise been resolved already

    // listen on the server compilations
    serverCompiler.hooks.compile.tap('server', () => {
        if (!appPromiseIsResolved) {
            // it has not been resolved so nothing to do yet
            return;
        }

        // inform we have not resolved instance
        appPromiseIsResolved = false;

        // set the resolve callback as appPromiseResolve and save the promise itself as appPromise
        // eslint-disable-next-line no-return-assign
        appPromise = new Promise((resolve) => (appPromiseResolve = resolve));
    });

    // app instance will remain here
    let app;

    // redirect the request to the resolved server
    server.use((req, res) => appPromise
        .then(() => app.handle(req, res))
        .catch((error) => console.error(error)));

    function checkForUpdate(fromUpdate) {
        // hell of a prefix...
        const hmrPrefix = '[\x1b[35mHMR\x1b[0m] ';

        if (!app.hot) {
            // Cannot do anything without the HOT module
            throw new Error(`${hmrPrefix}Hot Module Replacement is disabled.`);
        }

        if (app.hot.status() !== 'idle') {
            return Promise.resolve();
        }

        return app.hot
            .check(true)
            .then((updatedModules) => {
                if (!updatedModules) {
                    if (fromUpdate) {
                        console.info(`${hmrPrefix}Update applied.`);
                    }

                    return;
                }

                if (0 === updatedModules.length) {
                    console.info(`${hmrPrefix}Nothing hot updated.`);
                } else {
                    console.info(`${hmrPrefix}Updated modules:`);
                    updatedModules.forEach((moduleId) => console.info(`${hmrPrefix} - ${moduleId}`));
                    checkForUpdate(true);
                }
            })
            .catch((error) => {
                if (['abort', 'fail'].includes(app.hot.status())) {
                    console.warn(`${hmrPrefix}Cannot apply update.`);
                    // we cannot apply the update so we will reload the whole server
                    // but first delete the node cache
                    delete require.cache[require.resolve('../build/server')];
                    // now we can get the latest version of our server
                    // eslint-disable-next-line global-require, import/no-unresolved
                    app = require('../build/server').default;
                    console.warn(`${hmrPrefix}Server has been reloaded.`);
                } else {
                    console.warn(`${hmrPrefix}Update failed: ${error.stack || error.message}`);
                }
            });
    }

    // watch the server compiler
    serverCompiler.watch(watchOptions, (error, stats) => {
        if (app && !error && !stats.hasErrors()) {
            // first check for updates
            checkForUpdate().then(() => {
                appPromiseIsResolved = true;
                appPromiseResolve();
            });
        }
    });

    // Wait until both client and server bundles are ready
    await clientPromise;
    await serverPromise;

    // loader our server for the first time
    // eslint-disable-next-line global-require, import/no-unresolved
    app = require('../build/server').default;
    appPromiseIsResolved = true;
    appPromiseResolve();

    // launch the server
    const port = process.env.PORT || 3000;

    server.listen(port, () => {
        console.info(`The server is running at http://localhost:${port}/`);
    });

    return server;
}

export default start;
