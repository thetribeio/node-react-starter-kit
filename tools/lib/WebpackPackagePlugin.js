import { builtinModules } from 'module';
import path from 'path';
import pkg from '../../package.json';

const pluginName = 'WebpackPackagePlugin';

const getParentIdentifier = (identifier) => {
    if ('@' === identifier[0]) {
        return identifier.split('/').slice(0, 2).join('/');
    }

    return identifier.split('/')[0];
};

const defaultOptions = {
    additionalModules: [],
};

export default class WebpackPackagePlugin {
    constructor(options) {
        this.options = { ...defaultOptions, ...options };
    }

    apply(compiler) {
        const outputFolder = compiler.options.output.path;
        const outputFile = path.resolve(outputFolder, 'package.json');
        const outputName = path.relative(outputFolder, outputFile);

        compiler.hooks.emit.tap(pluginName, (compilation) => {
            const dependencies = {};

            const addDependency = (module) => {
                // avoid core package
                if (!builtinModules.includes(module)) {
                    // look for a match
                    const target = pkg.dependencies[module];

                    if (!target) {
                        // we fail if the dependencies is not added in the package.json
                        throw new Error(`the module ${module} is not listed in dependencies`);
                    }

                    // add the dependency
                    dependencies[module] = target;
                }
            };

            compilation.modules.forEach(({ request, external }) => {
                // we only look for external modules
                if (external && !request.startsWith('./')) {
                    // get the main module identifier and try to add i
                    addDependency(getParentIdentifier(request));
                }
            });

            // add additional dependencies
            this.options.additionalModules.forEach(addDependency);

            // write the new package.json
            const output = JSON.stringify({
                ...pkg,
                dependencies,
                devDependencies: undefined,
                scripts: {
                    start: 'node server.js',
                },
            });

            // add it through webpack assets
            // eslint-disable-next-line no-param-reassign
            compilation.assets[outputName] = {
                source: () => output,
                size: () => output.length,
            };
        });
    }
}
