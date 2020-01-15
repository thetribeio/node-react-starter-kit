import fs from 'fs';
import path from 'path';
import chalk from 'react-dev-utils/chalk';
import clearConsole from 'react-dev-utils/clearConsole';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import evalSourceMapMiddleware from 'react-dev-utils/evalSourceMapMiddleware';
import openBrowser from 'react-dev-utils/openBrowser';
import { prepareUrls } from 'react-dev-utils/WebpackDevServerUtils';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import clean from './clean';
import run from './run';
import webpackConfig from './webpack.config';

const isInteractive = process.stdout.isTTY;
const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;
const urls = prepareUrls('http', host, port);

const watchOptionsConfigFile = path.resolve(__dirname, '../watchOptions.config.js');

// https://webpack.js.org/configuration/watch/#watchoptions
// eslint-disable-next-line import/no-dynamic-require
const watchOptions = fs.existsSync(watchOptionsConfigFile) ? require(watchOptionsConfigFile) : {};

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

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
async function start() {
    const [clientConfig, serverConfig] = webpackConfig;

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

    let api; // app instance will remain here
    let apiPromise; // promise resolving the server
    let apiPromiseResolve; // resolve callback of the same promise
    let apiPromiseIsResolved = true; // has the promise been resolved already

    const handleByServer = async (req, res, next) => {
        try {
            await apiPromise;
            api.handle(req, res);
        } catch (error) {
            next(error);
        }
    };

    // webpack dev server (with HMR)
    const devServer = new WebpackDevServer(clientCompiler, {
        contentBase: path.resolve(__dirname, '../public'),
        disableHostCheck: true,
        compress: true,
        clientLogLevel: 'none',
        hot: true,
        publicPath: '/',
        quiet: true,
        watchOptions,
        host,
        overlay: false,
        historyApiFallback: false,
        public: urls.lanUrlForConfig,
        after(app) {
            // redirect the request to the resolved server
            app.use(handleByServer);
        },
        before(app, server) {
            // apply middlewares for dev purposes
            app.use(evalSourceMapMiddleware(server));
            app.use(errorOverlayMiddleware());
            // we have to manually handle the root route
            app.get('/', handleByServer);
        },
        writeToDisk: true,
    });

    // listen on the server compilations
    serverCompiler.hooks.compile.tap('server', () => {
        if (!apiPromiseIsResolved) {
            // it has not been resolved so nothing to do yet
            return;
        }

        // inform we have not resolved instance
        apiPromiseIsResolved = false;

        // set the resolve callback as apiPromiseResolve and save the promise itself as apiPromise
        // eslint-disable-next-line no-return-assign
        apiPromise = new Promise((resolve) => (apiPromiseResolve = resolve));
    });

    // watch the server compiler
    serverCompiler.watch(watchOptions, (error, stats) => {
        if (!error && !stats.hasErrors()) {
            try {
                // we cannot apply the update so we will reload the whole server
                // but first delete the node cache
                delete require.cache[require.resolve('../build/server')];

                // now we can get the latest version of our server
                // eslint-disable-next-line global-require, import/no-unresolved
                api = require('../build/server').default;

                console.warn('[\x1b[35mHot Reload\x1b[0m]  Server has been reloaded.');
            } catch (runtimeError) {
                // print the error
                console.error(runtimeError);
            }

            apiPromiseIsResolved = true;
            apiPromiseResolve();
        }
    });

    // Wait until both client and server bundles are ready
    await clientPromise;
    await serverPromise;

    // Launch WebpackDevServer.
    devServer.listen(port, host, (err) => {
        if (err) {
            console.error(err);

            return;
        }

        if (isInteractive) {
            clearConsole();
        }

        console.info(chalk.cyan('Starting the development server...\n'));
        openBrowser(urls.localUrlForBrowser);
    });

    return devServer;
}

export default start;
