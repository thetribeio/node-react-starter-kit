import path from 'path';
import chokidar from 'chokidar';
import { copyFile, makeDir, copyDir, cleanDir } from './lib/fs';

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy() {
    await makeDir('build');
    await copyDir('api/public', 'build/public');

    if (process.argv.includes('--watch')) {
        // watch the public directory
        const watcher = chokidar.watch(['api/public/**/*'], { ignoreInitial: true });

        watcher.on('all', async (event, filePath) => {
            // get the source path
            const src = path.relative('./', filePath);
            // then its path in the build directory
            const dist = path.join('build/', src.startsWith('src') ? path.relative('src', src) : src);

            // handle events
            switch (event) {
                case 'add':
                case 'change':
                    await makeDir(path.dirname(dist));
                    await copyFile(filePath, dist);
                    break;
                case 'unlink':
                case 'unlinkDir':
                    cleanDir(dist, { nosort: true, dot: true });
                    break;
                default:
                    break;
            }
        });
    }
}

export default copy;
