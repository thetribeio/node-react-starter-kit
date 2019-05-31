import { makeDir, copyDir } from './lib/fs';

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy() {
    await makeDir('build');
    await copyDir('public', 'build/public');
}

export default copy;
