import { cleanDir } from './lib/fs';

/**
 * Cleans up the output (build) directory.
 */
async function clean() {
    await cleanDir('build/*', {
        nosort: true,
        dot: true,
        // keep git files
        ignore: ['build/.git'],
    });
}

export default clean;
