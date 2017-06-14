"use strict";
const path = require('path');
const gulpwatch = require('gulp-watch');
const del = require('del');
const ejs = require('gulp-ejs');
const ejshelper = require('tmt-ejs-helper');
const async = require('async');
const gulp = require('gulp');
const less = require('gulp-less');
const autoprefixer = require("autoprefixer");
const postcss = require('gulp-postcss');   // CSS 预处理
const posthtml = require('gulp-posthtml');  // HTML 预处理
const webpack = require("webpack");
const fs= require("fs");
let webpackConfig = require('./webpack.js');
//const sass = require('gulp-sass');
const Common = require(path.join(__dirname, '../common.js'));

function dev(projectPath, log, callback) {

    const bs = require('browser-sync').create();  // 自动刷新浏览器

    let projectConfigPath = path.join(projectPath, 'weflow.config.json');
    let projectName = path.basename(projectPath);
    let config = null;

    if (Common.fileExist(projectConfigPath)) {
        config = Common.requireUncached(projectConfigPath);
    } else {
        config = Common.requireUncached(path.join(__dirname, '../../weflow.config.json'));
    }

    let paths = {
        src: {
            dir: path.join(projectPath, './src'),
            img: path.join(projectPath, './src/{img,images}/**/*'),
            slice: path.join(projectPath, './src/slice/**/*.png'),
            js: path.join(projectPath, './src/js/*.js'),
            media: path.join(projectPath, './src/media/**/*'),
            less: path.join(projectPath, './src/css/'+projectName+'.less'),
            lessAll: path.join(projectPath, './src/css/**/*.less'),
            html: [path.join(projectPath, './src/activities/*.html'), path.join(projectPath, '!./src/activities/_*/**.html')],
            htmlAll: path.join(projectPath, './src/activities/**/*.html')
        },
        dev: {
            dir: path.join(projectPath, './dev'),
            css: path.join(projectPath, './dev/css'),
            html: path.join(projectPath, './dev/activities'),
            js: path.join(projectPath, './dev/js')
        }
    };

    // 复制操作
    function copyHandler(type, file, cb) {
        if (typeof file === 'function') {
            cb = file;
            file = paths['src'][type];
        }

        gulp.src(file, {base: paths.src.dir})
            .pipe(gulp.dest(paths.dev.dir))
            .on('end', function () {
                console.log(`copy ${type} success.`);
                log(`copy ${type} success.`);
                cb ? cb() : reloadHandler();
            });
    }

    // 自动刷新
    function reloadHandler() {
        config.livereload && bs.reload();
    }

    function compileLess(cb) {
        gulp.src(paths.src.less)
            .pipe(less())
            .pipe(gulp.dest(paths.dev.css))
            .on('data', function () {
            })
            .on('end', function () {
                if (cb) {
                    console.log('compile Less success.');
                    log('compile Less success.');
                    cb();
                } else {
                    reloadHandler();
                }
            })
    }

    //编译 html
    function compileHtml(cb) {
        gulp.src(paths.src.html)
            .pipe(ejs(ejshelper()).on('error', function (error) {
                console.log(error.message);
                log(error.message);
            }))
            .pipe(gulp.dest(paths.dev.html))
            .on('data', function () {
            })
            .on('end', function () {
                if (cb) {
                    console.log('compile Html success.');
                    log('compile Html success.');
                    cb();
                } else {
                    reloadHandler();
                }
            })
    }

    //编译 js
    function compileJs(cb) {
        var myConfig = Object.create(webpackConfig);
        myConfig.entry = path.join(projectPath, './src/js/'+projectName+'.js')
        myConfig.output.path = path.join(projectPath, './dev/js/')
        myConfig.output.filename  = projectName+'.js';
        myConfig.resolveLoader = { modules: [path.join(__dirname, "../../node_modules")] };//必须指定WEBPACK使用的包路径，不然打包后webpack无法运行
        webpack(myConfig, function(err, stats) {
            if(err) log(err);
            if (cb) {
                console.log('compile js success.');
                log('compile js success.');
                cb();
            } else {
                reloadHandler();
            }
        });
    }

    //监听文件
    function watch(cb) {   
        let watcher = gulpwatch([
                paths.src.img,
                paths.src.slice,
                paths.src.js,
                paths.src.media,
                paths.src.lessAll,
                //paths.src.sassAll,
                paths.src.htmlAll
            ]
        );

        watcher
            .on('change', function (file) {
                console.log(file + ' has been changed');
                log(file + ' has been changed');
                watchHandler('changed', file);
            })
            .on('add', function (file) {
                console.log(file + ' has been added');
                log(file + ' has been added');
                watchHandler('add', file);
            })
            .on('unlink', function (file) {
                console.log(file + ' is deleted');
                log(file + ' is deleted');
                watchHandler('removed', file);
            });

        console.log('watching...');
        log('watching...');

        cb();
    }

    function watchHandler(type, file) {

        let target = file.split('src')[1].match(/[\/\\](\w+)[\/\\]/);

        if (target.length && target[1]) {
            target = target[1];
        }

        switch (target) {
            case 'images':
            case 'img':
                if (type === 'removed') {
                    let tmp = file.replace(/src/, 'dev');
                    del([tmp], {force: true}).then(function () {
                        reloadHandler();
                    });
                } else {
                    copyHandler('img', file);
                }
                break;

            case 'slice':
                if (type === 'removed') {
                    var tmp = file.replace(/src/, 'dev');
                    del([tmp], {force: true});
                } else {
                    copyHandler('slice', file);
                }
                break;

            case 'js':
                if (type === 'removed') {
                    var tmp = file.replace(/src/, 'dev');
                    del([tmp], {force: true});
                } else {
                    compileJs();
                }
                break;

            case 'media':
                if (type === 'removed') {
                    var tmp = file.replace(/src/, 'dev');
                    del([tmp], {force: true});
                } else {
                    copyHandler('media', file);
                }
                break;

            case 'css':

                var ext = path.extname(file);

                if (type === 'removed') {
                    var tmp = file.replace(/src/, 'dev').replace('.less', '.css');
                    del([tmp], {force: true});
                } else {
                    if (ext === '.less') {
                        compileLess();
                    } else {
                        //compileSass();
                    }
                }

                break;
            case 'activities':
            case 'html':
                if (type === 'removed') {
                    let tmp = file.replace(/src/, 'dev');
                    del([tmp], {force: true}).then(function () {
                    });
                } else {
                    compileHtml();
                }

                break;
        }

    };
    function getIPAdress(){  
        var interfaces = require('os').networkInterfaces();  
        for(var devName in interfaces){  
              var iface = interfaces[devName];  
              for(var i=0;i<iface.length;i++){  
                   var alias = iface[i];  
                   if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                         return alias.address;  
                   }  
              }  
        }  
    }  
    //启动 livereload
    function startServer(cb) {
        bs.init({
            host: getIPAdress(),
            open: 'external',
            server: {
                baseDir: paths.dev.dir,
                directory: true
            },
            startPath: "/activities/"+projectName+'.html',
            port: 8080,
            reloadDelay: 0,
            timestamps: true,
            notify: {      //自定制livereload 提醒条
                styles: [
                    "margin: 0",
                    "padding: 5px",
                    "position: fixed",
                    "font-size: 10px",
                    "z-index: 9999",
                    "bottom: 0px",
                    "right: 0px",
                    "border-radius: 0",
                    "border-top-left-radius: 5px",
                    "background-color: rgba(60,197,31,0.5)",
                    "color: white",
                    "text-align: center"
                ]
            }
        });

        cb();
    }

    async.series([
        /**
         * 先删除目标目录,保证最新
         * @param next
         */
            function (next) {
            del(paths.dev.dir, {force: true}).then(function () {
                next();
            })
        },
        /**
         * 一些可以同步的操作
         * 复制 img, slice, js, media
         * 编译LESS
         * 编译HTML
         * @param next
         */
            function (next) {
            async.parallel([
                function (cb) {
                    copyHandler('img', cb);
                },
                /*function (cb) {
                    copyHandler('slice', cb);
                },*/
                function (cb) {
                    compileJs(cb);
                },
                function (cb) {
                    copyHandler('media', cb);
                },
                function (cb) {
                    compileLess(cb);
                },
                /*function (cb) {
                    compileSass(cb);
                },*/
                function (cb) {
                    compileHtml(cb);
                }
            ], function (error) {
                if (error) {
                    throw new Error(error);
                }

                next();
            })
        },
        function (next) {
            watch(next);
        },
        function (next) {
            startServer(next);
        }
    ], function (error) {
        if (error) {
            throw new Error(error);
        }

        callback && callback(bs);
    });
}

module.exports = dev;


