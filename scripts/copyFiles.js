import path from 'path';
import glob from 'glob';
import fse from 'fs-extra';

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