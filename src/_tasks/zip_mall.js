"use strict";

const path = require('path');
const util = require(path.join(__dirname, './lib/util'));
const del = require('del');
const zip = require('gulp-zip');
const async = require('async');
const Common = require(path.join(__dirname, '../common.js'));

module.exports = function (projectPath, log, callback) {
    let projectName = path.basename(projectPath);
    //清除目标目录
    function delDist(cb) {
        del(path.join(projectPath, './zip'), {force: true}).then(function () {
            cb && cb();
        })
    }

    function zipTask(cb) {
        gulp.src(path.join(projectPath, './dist/**/*'))
            .pipe(gulp.dest(path.join(projectPath, './zip/activities')))
            .on('end', function(){
                gulp.src(path.join(projectPath, './zip/**/*'))
                .pipe(zip('webapp.zip'))
                .pipe(gulp.dest(projectPath))
                .on('end', function(){
                    console.log('zip success.');
                    log('zip success.');
                    cb && cb();
                });
            });
    }

    if(!Common.dirExist(path.join(projectPath, './dist'))){
        alert("请先生产编译后再打包.")
        callback && callback();
        return;
    }
    async.series([
        function(next){
            zipTask(next);
        }
    ], function(err){
        if(err){
            throw new Error(err);
        }

        delDist();

        callback && callback();
    });
};
