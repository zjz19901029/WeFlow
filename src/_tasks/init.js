"use strict";
const path = require('path');
const del = require('del');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const ejshelper = require('tmt-ejs-helper');
const async = require('async');
const gulp = require('gulp');

function init(projectPath, log, callback){
    let projectName = path.basename(projectPath);

    function ejsCompile(next){
        gulp.src([path.join(projectPath,'src/{activities,js,css}/*'),path.join("!",projectPath,'src/{activities,js,css}/*.ejs')])
            .pipe(ejs({project:projectName}))
            .pipe(gulp.dest(function(file){
                return file.base
            }))
            .on('end', function () {next();});
    }

    function htmlRename(next){
        gulp.src(path.join(projectPath,'src/activities/project.*'))
            .pipe(rename({basename: projectName}))
            .pipe(gulp.dest(path.join(projectPath,'src/activities')))
            .on('end', function () {next();});
    }

    function jsRename(next){
        gulp.src(path.join(projectPath,'src/js/project.*'))
            .pipe(rename({basename: projectName}))
            .pipe(gulp.dest(path.join(projectPath,'src/js')))
            .on('end', function () {next();});
    }

    function cssRename(next){
        gulp.src(path.join(projectPath,'src/css/project.*'))
            .pipe(rename({basename: projectName}))
            .pipe(gulp.dest(path.join(projectPath,'src/css')))
            .on('end', function () {next();});
    }

    function imgRename(next){
        try {//创建项目专属的img文件夹
            fs.rename(path.join(projectPath,'src/img/project'),path.join(projectPath,'src/img',projectName));
        } catch (err) {
            throw new Error(err);
        }
        next();
    }

    function delFile(next){
        del([path.join(projectPath,'src/{activities,css,js}/project.*')], {force: true});
        next();
    }

    async.series([
        /**
         * ejs处理html模板
         */
        function (next) {
            ejsCompile(next);
        },
        function (next) {
            htmlRename(next);
        },
        function (next) {
            jsRename(next)
        },
        function (next) {
            cssRename(next)
        },
        function (next) {
            imgRename(next)
        },
        function (next) {
            delFile(next)
        }
    ], function (error) {
        if (error) {
            throw new Error(error);
        }
        callback && callback(projectPath);
    });
}

module.exports = init;