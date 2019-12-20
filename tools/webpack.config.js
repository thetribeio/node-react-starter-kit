import fs from 'fs';
import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import nodeExternals from 'webpack-node-externals';
import pkg from '../package.json';
import PackagePlugin from './lib/WebpackPackagePlugin';

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const isDebug = process.env.NODE_ENV !== 'production';
const isAnalyze = process.argv.includes('--analyze');

const getBabelRule = (envPresetOptions) => ({
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
            ['@babel/preset-env', envPresetOptions],

            // JSX
            // https://github.com/babel/babel/tree/master/packages/babel-preset-react
            ['@babel/preset-react', { development: isDebug }],
        ],

        plugins: [
            ['@babel/plugin-transform-runtime', {
                corejs: false,
                helpers: isDebug,
                regenerator: true,
                absoluteRuntime: true,
            }],
        ],
    },
});

const getImageRule = (options) => ({
    test: /\.(png|jpg|gif|svg)$/,
    rules: [
        {
            loader: 'file-loader',
            options: {
                name: '[hash:20].[ext]',
                ...options,
            },
        },
        {
            loader: 'image-webpack-loader',
        },
    ],
});

const sharedRules = [
    // Exclude dev modules from production build
    !isDebug && {
        test: path.resolve(rootDir, 'node_modules/react-deep-force-update/lib/index.js'),
        loader: 'null-loader',
    },
].filter(Boolean);

const config = {
    context: rootDir,

    mode: isDebug ? 'development' : 'production',

    output: {
        pathinfo: isDebug,
        publicPath: '/',
        filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
        chunkFilename: isDebug ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json', '.mjs'],
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

const styleRules = [
    {
        oneOf: [
            {
                loader: 'css-loader',
                options: {
                    localsConvention: 'camelCase',
                    modules: {
                        mode: 'pure',
                    },
                },
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
];

const clientConfig = {
    ...config,

    name: 'client',
    target: 'web',

    entry: {
        client: [
            isDebug && 'react-dev-utils/webpackHotDevClient',
            './app/index.jsx',
        ].filter(Boolean),
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
        rules: [
            // Rules for JS / JSX
            getBabelRule({
                targets: { browsers: pkg.browserslist },
                // Allow importing core-js in entrypoint and use browserlist to select polyfills
                useBuiltIns: 'entry',
                // Set the corejs version we are using to avoid warnings in console
                // This will need to change once we upgrade to corejs@3
                corejs: 3,
                // Do not transform modules to CJS
                modules: false,
            }),

            // Shared rules
            ...sharedRules,

            // Style rules
            {
                test: /\.s?css$/,
                rules: [
                    { loader: isDebug ? 'style-loader' : MiniCssExtractPlugin.loader },
                    ...styleRules,
                ],
            },

            // Images
            getImageRule(),
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
                                if (file.endsWith('.hot-update.js')) {
                                    continue;
                                }

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

        !isDebug && new MiniCssExtractPlugin({ filename: '[contenthash].css' }),

        // Hot Module Replacement plugin
        isDebug && new webpack.HotModuleReplacementPlugin(),

        // Webpack Bundle Analyzer
        // https://github.com/th0r/webpack-bundle-analyzer
        isDebug && isAnalyze && new BundleAnalyzerPlugin(),
    ].filter(Boolean),

    // Move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
    optimization: {
        minimize: !isDebug,
        minimizer: [
            // This is only used in production mode
            new TerserPlugin({
                terserOptions: {
                    parse: {
                        // we want terser to parse ecma 8 code. However, we don't want it
                        // to apply any minification steps that turns valid ecma 5 code
                        // into invalid ecma 5 code. This is why the 'compress' and 'output'
                        // sections only apply transformations that are ecma 5 safe
                        // https://github.com/facebook/create-react-app/pull/4234
                        ecma: 8,
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        // Disabled because of an issue with Uglify breaking seemingly valid code:
                        // https://github.com/facebook/create-react-app/issues/2376
                        // Pending further investigation:
                        // https://github.com/mishoo/UglifyJS2/issues/2011
                        comparisons: false,
                        // Disabled because of an issue with Terser breaking valid code:
                        // https://github.com/facebook/create-react-app/issues/5250
                        // Pending further investigation:
                        // https://github.com/terser-js/terser/issues/120
                        inline: 2,
                    },
                    mangle: {
                        safari10: true,
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        // Turned on because emoji and regex is not minified properly using default
                        // https://github.com/facebook/create-react-app/issues/2488
                        ascii_only: true,
                    },
                },

                // Enable file caching
                cache: true,
                sourceMap: true,
            }),
        ],

        // Automatically split vendor and commons
        // https://twitter.com/wSokra/status/969633336732905474
        // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
        splitChunks: {
            chunks: 'all',
            name: false,
        },

        // Keep the runtime chunk separated to enable long term caching
        // https://twitter.com/wSokra/status/969679223278505985
        runtimeChunk: true,
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
        server: ['./api/index.js'],
    },

    output: {
        ...config.output,
        path: buildDir,
        filename: '[name].js',
        chunkFilename: 'chunks/[name].js',
        libraryTarget: 'commonjs2',

        ...isDebug && {
            hotUpdateMainFilename: 'updates/[hash].hot-update.json',
            hotUpdateChunkFilename: 'updates/[id].[hash].hot-update.js',
        },
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
        rules: [
            // Rules for JS / JSX
            getBabelRule({
                targets: { node: pkg.engines.node.match(/(\d+\.?)+/)[0] },
                modules: false,
                useBuiltIns: false,
                debug: false,
            }),

            // Shared rules
            ...sharedRules,

            // Images
            getImageRule({ emitFile: false }),
        ],
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

        !isDebug && new PackagePlugin({
            additionalModules: ['source-map-support', 'sequelize-cli'],
        }),
    ].filter(Boolean),

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
