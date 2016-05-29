'use strict';

const path = require('path');
const fs = require('fs');
const vfs = require('vinyl-fs');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const md5 = require('crypto-md5');
const Common = require('./common');

function createDev(projectPath, callback) {
    let source = path.join(__dirname, './_tasks/dev.js');
    let target = path.join(__dirname, './_tasks/tmp_dev');
    let devName = md5(projectPath, 'hex') + '.js';
    let devPath = path.join(target, devName);

    if (!Common.fileExist(devPath)) {
        vfs.src(source)
            .pipe(replace('placeholder', projectPath))
            .pipe(rename(devName))
            .pipe(vfs.dest(target))
            .on('end', function () {
                callback && callback(projectPath, devPath);
            })
    } else {
        callback && callback(projectPath, devPath)
    }
}

module.exports = createDev;
