import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import nodeExternals from 'webpack-node-externals';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import overrideRules from './lib/overrideRules';
import PackagePlugin from './lib/WebpackPackagePlugin';
import pkg from '../package.json';

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const isDebug = process.env.NODE_ENV !== 'production';
const isAnalyze = process.argv.includes('--analyze');

const config = {
    context: rootDir,

    mode: isDebug ? 'development' : 'production',

    output: {
        publicPath: '/',
        filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
        chunkFilename: isDebug ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json', '.mjs'],
    },

    module: {
        rules: [
            // Rules for JS / JSX
            {
                test: /\.jsx?$/,
                include: [
                    path.join(rootDir, 'app'),
                    path.join(rootDir, 'api'),
                    path.join(rootDir, 'tools'),
                ],
                loader: 'babel-loader',
                options: {
                    // https://github.com/babel/babel-loader#options
                    cacheDirectory: isDebug,

                    // https://babeljs.io/docs/usage/options/
                    babelrc: false,

                    presets: [
                        // A Babel preset that can automatically determine the Babel plugins and polyfills
                        // https://github.com/babel/babel-preset-env
                        ['@babel/preset-env', {
                            targets: { browsers: pkg.browserslist },
                            forceAllTransforms: !isDebug, // for UglifyJS
                            modules: false,
                            useBuiltIns: false,
                            debug: false,
                        }],

                        // JSX
                        // https://github.com/babel/babel/tree/master/packages/babel-preset-react
                        ['@babel/preset-react', { development: isDebug }],
                    ],
                },
            },

            // Exclude dev modules from production build
            ...(isDebug ? [] : [{
                test: path.resolve(rootDir, 'node_modules/react-deep-force-update/lib/index.js'),
                loader: 'null-loader',
            }]),
        ],
    },

    // Don't attempt to continue if there are any errors.
    bail: !isDebug,

    cache: isDebug,

    // Specify what bundle information gets displayed
    // https://webpack.js.org/configuration/stats/
    stats: {
        cached: false,
        cachedAssets: false,
        chunks: false,
        chunkModules: false,
        colors: true,
        hash: false,
        modules: false,
        reasons: isDebug,
        timings: true,
        version: false,
    },

    // Choose a developer tool to enhance debugging
    // https://webpack.js.org/configuration/devtool/#devtool
    devtool: isDebug ? 'cheap-module-inline-source-map' : 'source-map',
};

const clientConfig = {
    ...config,

    name: 'client',
    target: 'web',

    entry: {
        client: ['@babel/polyfill', './app/index.jsx'],
    },

    output: {
        ...config.output,
        path: path.join(buildDir, 'public'),
    },

    resolve: {
        // Webpack mutates resolve object, so clone it to avoid issues
        // https://github.com/webpack/webpack/issues/4817
        ...config.resolve,
        // Allow absolute paths in imports through an alias, e.g. import Button from '@app/components/Button'
        alias: {
            '@app': path.resolve('./app'),
        },
    },

    module: {
        ...config.module,
        rules: [
            ...config.module.rules,
            {
                test: /\.s?css$/,
                rules: [
                    { loader: isDebug ? 'style-loader' : MiniCssExtractPlugin.loader },
                    {
                        oneOf: [
                            {
                                loader: 'css-loader',
                                options: { camelCase: 'only', modules: true },
                                // only use module style in the directories components & routes
                                include: [
                                    path.join(rootDir, 'app/components'),
                                    path.join(rootDir, 'app/routes'),
                                ],
                            },
                            { loader: 'css-loader' },
                        ],
                    },
                    { loader: 'sass-loader', test: /\.scss$/ },
                ],
            },
        ],
    },

    plugins: [
        // Define free variables
        // https://webpack.js.org/plugins/define-plugin/
        new webpack.DefinePlugin({ __DEV__: isDebug }),

        // we need to build a manifest for the backend
        new WebpackAssetsManifest({
            publicPath: true,
            writeToDisk: true,
            output: path.resolve(buildDir, 'asset-manifest.json'),
            done: (manifest, stats) => {
                const addPath = (file) => manifest.getPublicPath(file);
                // write chunk-manifest.json.json
                const chunkFileName = path.resolve(buildDir, 'chunk-manifest.json');

                try {
                    const chunkFiles = stats.compilation.chunkGroups.reduce((acc, entry) => {
                        if (!acc[entry.name]) {
                            // initialize the first time an empty map
                            acc[entry.name] = { js: [], css: [] };
                        }

                        const entryMap = acc[entry.name];

                        // first loop on chunks
                        for (const chunk of entry.chunks) {
                            // then on files for each chunk
                            for (const file of chunk.files) {
                                if (file.endsWith('.js')) {
                                    entryMap.js.push(addPath(file));
                                }

                                if (file.endsWith('.css')) {
                                    entryMap.css.push(addPath(file));
                                }
                            }
                        }

                        return acc;
                    }, {});

                    // write it on the disk
                    fs.writeFileSync(chunkFileName, JSON.stringify(chunkFiles, null, 2));
                } catch (err) {
                    console.error(`ERROR: Cannot write ${chunkFileName}: `, err);

                    if (!isDebug) {
                        // exit for production, it's critical
                        process.exit(1);
                    }
                }
            },
        }),

        ...(isDebug ? [] : [
            new MiniCssExtractPlugin({ filename: '[contenthash].css' }),
            // Webpack Bundle Analyzer
            // https://github.com/th0r/webpack-bundle-analyzer
            ...(isAnalyze ? [new BundleAnalyzerPlugin()] : []),
        ]),
    ],

    // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                },
            },
        },
    },

    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    // https://webpack.js.org/configuration/node/
    // https://github.com/webpack/node-libs-browser/tree/master/mock
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};

const serverConfig = {
    ...config,

    name: 'server',
    target: 'node',

    entry: {
        server: ['@babel/polyfill/noConflict', './api/index.js'],
    },

    output: {
        ...config.output,
        path: buildDir,
        filename: '[name].js',
        chunkFilename: 'chunks/[name].js',
        libraryTarget: 'commonjs2',
    },

    resolve: {
        // Webpack mutates resolve object, so clone it to avoid issues
        // https://github.com/webpack/webpack/issues/4817
        ...config.resolve,
        // Allow absolute paths in imports through an alias, e.g. import Button from '@app/components/Button'
        alias: {
            '@api': path.resolve('./api'),
        },
    },

    module: {
        ...config.module,

        rules: overrideRules(config.module.rules, (rule) => {
            switch (rule.loader) {
                case 'babel-loader':
                    // Override babel-preset-env configuration for Node.js
                    return {
                        ...rule,
                        options: {
                            ...rule.options,
                            presets: rule.options.presets.map((preset) => ('@babel/preset-env' !== preset[0]
                                ? preset
                                : ['@babel/preset-env', {
                                    targets: { node: pkg.engines.node.match(/(\d+\.?)+/)[0] },
                                    modules: false,
                                    useBuiltIns: false,
                                    debug: false,
                                }])),
                        },
                    };

                default:
                    return rule;
            }
        }),
    },

    plugins: [
        // Define free variables
        // https://webpack.js.org/plugins/define-plugin/
        new webpack.DefinePlugin({ __DEV__: isDebug }),

        // Adds a banner to the top of each generated chunk
        // https://webpack.js.org/plugins/banner-plugin/
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true,
            entryOnly: false,
        }),

        ...(isDebug ? [] : [new PackagePlugin({
            additionalModules: ['source-map-support', 'sequelize-cli'],
        })]),
    ],

    externals: [
        './asset-manifest.json',
        './chunk-manifest.json',
        nodeExternals(),
    ],

    // Do not replace node globals with polyfills
    // https://webpack.js.org/configuration/node/
    node: {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
    },
};

export default [clientConfig, serverConfig];
