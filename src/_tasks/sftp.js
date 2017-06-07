"use strict"

const path = require('path');
const async = require('async');
const gulp = require('gulp');
const _ = require('lodash');
const del = require('del');
const sftp = require('gulp-sftp');
const util = require('./lib/util');
const Common = require(path.join(__dirname, '../common'));

module.exports = function (projectPath, log, callback) {

    let projectConfigPath = path.join(projectPath, 'weflow.config.json');
    let config = null,config_all = null;

    if (Common.fileExist(projectConfigPath)) {
        config = Common.requireUncached(projectConfigPath);
        config_all = Common.requireUncached(path.join(__dirname, '../../weflow.config.json'));
    } else {
        config = config_all = Common.requireUncached(path.join(__dirname, '../../weflow.config.json'));
    }

    let configSFTP = config.ftp;

    if (configSFTP.host === '' || configSFTP.pass === '' || configSFTP.user === '' || configSFTP.remotePath === '') {
        configSFTP = config_all.ftp;
        if (configSFTP.host === '' || configSFTP.pass === '' || configSFTP.user === '' || configSFTP.remotePath === '') {
            callback('ftp config');
            return;
        }
    }

    let projectName = path.basename(projectPath);

    //清除目标目录
    function delDist(cb) {
        del(path.join(projectPath, './dist'), {force: true}).then(function () {
            cb && cb();
        })
    }

    function remoteSftp(cb) {
        let remotePath = config['sftp']['remotePath'] || "";
        let distPath = config['sftp']['includeHtml'] ? path.join(projectPath, './dev/**/*') : [path.join(projectPath, './dev/**/*'), path.join(projectPath, '!./dev/{html,activities}/**/*.html')];


        gulp.src(distPath, {base: './dev'})
            .pipe(sftp(configSFTP))
            .on('end', function () {
                console.log('sftp success.');
                log('sftp success.');
                cb && cb();
            });
    }

    async.series([
        function (next) {
            remoteSftp(next);
        }
    ], function (err) {
        if (err) {
            throw new Error(err);
        }

        //delDist();

        callback && callback();
    });
};
