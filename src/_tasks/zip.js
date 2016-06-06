"use strict";

const path = require('path');
const util = require(path.join(__dirname, './lib/util'));
const vfs = require('vinyl-fs');
const del = require('del');
const zip = require('gulp-zip');
const async = require('async');

module.exports = function (projectPath, log, callback) {

    //清除目标目录
    function delDist(cb) {
        del(path.join(projectPath, './dist'), {force: true}).then(function () {
            cb && cb();
        })
    }

    function zipTask(cb){
        vfs.src(path.join(projectPath, './dist/**/*'))
            .pipe(zip('dist.zip'))
            .pipe(vfs.dest(projectPath))
            .on('end', function(){
                console.log('zip success.');
                log('zip success.');
                cb && cb();
            })
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
