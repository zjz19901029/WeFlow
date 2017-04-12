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

	function htmlCompile(next){
		gulp.src(path.join(projectPath,'src/activities/index.html'))
            .pipe(ejs({projectname:projectName}))
            .pipe(rename({basename: projectName}))
            .pipe(gulp.dest(path.join(projectPath,'src/activities')))
            .on('end', function () {del([path.join(projectPath,'src/activities/index.html')], {force: true});next();});
	}

	function jsRename(next){
		try {//创建项目专属的js文件
            fs.rename(path.join(projectPath,'src/js/index.js'),path.join(projectPath,'src/js',projectName+'.js'));
        } catch (err) {
            throw new Error(err);
        }
        next();
	}

	function cssRename(next){
		try {//创建项目专属的css文件
            fs.rename(path.join(projectPath,'src/css/index.scss'),path.join(projectPath,'src/css',projectName+'.scss'));
        } catch (err) {
            throw new Error(err);
        }
        next();
	}

	async.series([
        /**
         * ejs处理html模板
         */
        function (next) {
            htmlCompile(next);
        },
        function (next) {
        	jsRename(next)
        },
        function (next) {
        	cssRename(next)
        }
    ], function (error) {
        if (error) {
            throw new Error(error);
        }
        callback && callback(projectPath);
    });
}

module.exports = init;