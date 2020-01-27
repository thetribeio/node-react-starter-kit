import fs from 'fs';
import path from 'path';
import glob from 'glob';
import rimraf from 'rimraf';

export const copyFile = (source, target) => new Promise((resolve, reject) => {
    let cbCalled = false;

    function done(err) {
        if (!cbCalled) {
            cbCalled = true;
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        }
    }

    const rd = fs.createReadStream(source);
    rd.on('error', (err) => done(err));

    const wr = fs.createWriteStream(target);
    wr.on('error', (err) => done(err));
    wr.on('close', (err) => done(err));

    rd.pipe(wr);
});

export const readDir = (pattern, options) => new Promise((resolve, reject) => glob(
    pattern,
    options,
    (err, result) => (err ? reject(err) : resolve(result)),
));

export const makeDir = (name) => fs.promises.mkdir(name, { recursive: true });

export const copyDir = async (source, target) => {
    const dirs = await readDir('**/*.*', {
        cwd: source,
        nosort: true,
        dot: true,
    });

    await Promise.all(
        dirs.map(async (dir) => {
            const from = path.resolve(source, dir);
            const to = path.resolve(target, dir);
            await makeDir(path.dirname(to));
            await copyFile(from, to);
        }),
    );
};

export const cleanDir = (pattern, options) => new Promise((resolve, reject) => rimraf(
    pattern,
    { glob: options },
    (err, result) => (err ? reject(err) : resolve(result)),
));
