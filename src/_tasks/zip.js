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
        del(path.join(projectPath, './dist'), {force: true}).then(function () {
            cb && cb();
        })
    }

    function formatDate(date,fmt) {
        var o = {
            "M+": date.getMonth() + 1, //月份 
            "d+": date.getDate(), //日 
            "h+": date.getHours(), //小时 
            "m+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    function zipTask(cb) {
        let date = formatDate(new Date(),'yyyyMMddhhmm');
        gulp.src([path.join(projectPath, './dist/**/*'),path.join(projectPath, '!./dist/img/**/*')])
            .pipe(zip(projectName+'_'+date+'.zip'))
            .pipe(gulp.dest(projectPath))
            .on('end', function(){
                console.log('zip success.');
                log('zip success.');
                cb && cb();
            })
    }

    function zipCDN(cb) {
        let date = formatDate(new Date(),'yyyyMMddhhmm');
        gulp.src(path.join(projectPath, './dist/img/**/*'))
            .pipe(zip(projectName+'_CDN_'+date+'.zip'))
            .pipe(gulp.dest(projectPath))
            .on('end', function(){
                console.log('zip success.');
                log('zip success.');
                cb && cb();
            })
    }
    if(!Common.dirExist(path.join(projectPath, './dist'))){
        alert("请先生产编译后再打包.")
        callback && callback();
        return;
    }
    async.series([
        function(next){
            zipTask(next);
        },
        function(next){
            zipCDN(next);
        }
    ], function(err){
        if(err){
            throw new Error(err);
        }

        //delDist();

        callback && callback();
    });
};
