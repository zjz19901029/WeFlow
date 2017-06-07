"use strict"

const path = require('path');
const async = require('async');
const gulp = require('gulp');
const _ = require('lodash');
const del = require('del');
const ftp = require('gulp-ftp');
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

    let configFTP = config.ftp;

    if (configFTP.host === '' || configFTP.pass === '' || configFTP.user === '' || configFTP.remotePath === '') {
        configFTP = config_all.ftp;
        if (configFTP.host === '' || configFTP.pass === '' || configFTP.user === '' || configFTP.remotePath === '') {
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

    function remoteFtp(cb) {
        let distPath = configFTP['includeHtml'] ? path.join(projectPath, './dev/**/*') : [path.join(projectPath, './dev/**/*'), path.join(projectPath, '!./dev/{html,activities}/**/*.html')];
        let deploy = configFTP.ssh?sftp:ftp;
        configFTP.callback = function(){
            console.log('ftp success.');
            log('ftp success.');
            cb && cb();
        }
        gulp.src(distPath)
            .pipe(deploy(configFTP));
    }

    async.series([
        function (next) {
            remoteFtp(next);
        }
    ], function (err) {
        if (err) {
            throw new Error(err);
        }

        //delDist();

        callback && callback();
    });
};
