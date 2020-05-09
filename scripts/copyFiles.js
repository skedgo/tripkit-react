/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const glob = require('glob');
const fse = require('fs-extra');

function copyFiles(ms) {
    /* eslint-enable @typescript-eslint/no-var-requires */
    const srcDir = path.join('./src');
    const distDir = path.join('./dist/' + ms);
    const files = glob.sync('**/*.+(d.ts|css|png|json)', {
        cwd: srcDir
    });
    files.forEach(file => {
        const from = path.join(srcDir, file);
        const to = path.join(distDir, file);
        fse.copySync(from, to);
    });
}

copyFiles('js');
copyFiles('esm');
copyFiles('umd');