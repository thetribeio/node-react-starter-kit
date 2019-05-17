// Jest configuration
// https://facebook.github.io/jest/docs/en/configuration.html
module.exports = {
    // Modules can be explicitly auto-mocked using jest.mock(moduleName).
    // https://facebook.github.io/jest/docs/en/configuration.html#automock-boolean
    automock: false,

    // Respect Browserify's "browser" field in package.json when resolving modules.
    // https://facebook.github.io/jest/docs/en/configuration.html#browser-boolean
    browser: false,

    // This config option can be used here to have Jest stop running tests after the first failure.
    // https://facebook.github.io/jest/docs/en/configuration.html#bail-boolean
    bail: false,

    // https://facebook.github.io/jest/docs/en/configuration.html#collectcoveragefrom-array
    collectCoverageFrom: [
        'api/**/*.{js,jsx}',
        'app/**/*.{js,jsx}',
        '!**/node_modules/**',
        '!**/vendor/**',
    ],

    // https://facebook.github.io/jest/docs/en/configuration.html#coveragedirectory-string
    coverageDirectory: '<rootDir>/coverage',

    globals: {
        __DEV__: true,
    },

    // The default extensions Jest will look for.
    // https://facebook.github.io/jest/docs/en/configuration.html#modulefileextensions-array-string
    moduleFileExtensions: ['js', 'json', 'jsx', 'node'],

    // A map from regular expressions to module names that allow to stub out resources,
    // like images or styles with a single module.
    moduleNameMapper: {
        '\\.(css|less|styl|scss|sass|sss)$': 'identity-obj-proxy',
    },

    transform: {
        '\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
        '^(?!.*\\.(js|jsx|json|css|less|styl|scss|sass|sss)$)':
            '<rootDir>/tools/lib/fileTransformer.js',
    },

    verbose: true,
};
