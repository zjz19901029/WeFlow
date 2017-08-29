"use strict";

const _ = require('lodash');
const async = require('async');
const gulp = require('gulp');
const fs = require('fs');
const del = require('del');
const path = require('path');
const ejs = require('gulp-ejs');
const gulpif = require('gulp-if');
const less = require('gulp-less');
const util = require(path.join(__dirname, './lib/util'));
const uglify = require('gulp-uglify');
const usemin = require('gulp-usemin');
const lazyImageCSS = require('gulp-lazyimagecss');  // 自动为图片样式添加 宽/高/background-size 属性
const minifyCSS = require('gulp-cssnano');
const imagemin = require('weflow-imagemin');
const replace = require('gulp-replace');
//const tmtsprite = require('gulp-tmtsprite');   // 雪碧图合并
const ejshelper = require('tmt-ejs-helper');
const postcss = require('gulp-postcss');  // CSS 预处理
const postcssPxtorem = require('postcss-pxtorem'); // 转换 px 为 rem
const autoprefixer = require('gulp-autoprefixer');
/*const posthtml = require('gulp-posthtml');
const posthtmlPx2rem = require('posthtml-px2rem');
const RevAll = require('weflow-rev-all');   // reversion
const revDel = require('gulp-rev-delete-original');*/
const webpack = require("webpack");
let webpackConfig = require('./webpack.js');
//const sass = require('gulp-sass');
const Common = require(path.join(__dirname, '../common'));

let webp = require(path.join(__dirname, './common/webp'));
let changed = require(path.join(__dirname, './common/changed'))();

function dist(projectPath, log, callback) {

    let projectConfigPath = path.join(projectPath, 'weflow.config.json');
    let projectName = path.basename(projectPath);
    let config = null,config_all = null;

    if (Common.fileExist(projectConfigPath)) {
        config = Common.requireUncached(projectConfigPath);
        config_all = Common.requireUncached(path.join(__dirname, '../../weflow.config.json'));
    } else {
        config = config_all = Common.requireUncached(path.join(__dirname, '../../weflow.config.json'));
    }
    let CDN = "";
    if(config.cdn.supportCDN&&config.cdn.path){
        CDN = config.cdn.path;
    }

    let lazyDir = config.lazyDir || ['../slice'];

  /*  let postcssOption = [];

    if (config.supportREM) {
        postcssOption = [
            postcssAutoprefixer({browsers: ['last 9 versions']}),
            postcssPxtorem({
                root_value: '75', // 基准值 html{ font-zise: 20px; }
                prop_white_list: [], // 对所有 px 值生效
                minPixelValue: 2 // 忽略 1px 值
            })
        ]
    } else {
        postcssOption = [
            postcssAutoprefixer({browsers: ['last 9 versions']})
        ]
    }*/

    let paths = {
        src: {
            dir: path.join(projectPath, './src'),
            img: path.join(projectPath, './src/img/**/*.{JPG,jpg,png,gif,svg}'),
            js: path.join(projectPath, './src/js/*.js'),
            media: path.join(projectPath, './src/media/**/*'),
            less: path.join(projectPath, './src/css/'+projectName+'.less'),
            //sass: path.join(projectPath, './src/css/style-*.scss'),
            html: path.join(projectPath, './src/activities/*.html'),
            htmlAll: path.join(projectPath, './src/activities/**/*')
        },
        dist: {
            dir: path.join(projectPath, './dist'),
            css: path.join(projectPath, './dist/css'),
            img: path.join(projectPath, './dist/img'),
            html: path.join(projectPath, './dist/activities'),
            sprite: path.join(projectPath, './dist/sprite')
        }
    };

    // 清除 dist 目录
    function delDist(cb) {
        del(paths.dist.dir, {force: true}).then(function () {
            cb();
        })
    }

    function condition(file) {
        return path.extname(file.path) === '.png';
    }

    //编译 less
    function compileLess(cb) {
        gulp.src(paths.src.less)
            .pipe(less())
            .pipe(gulpif(CDN!="",replace('../img', CDN)))
            .pipe(autoprefixer({
                browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android >= 4.0'],
                cascade: true, //是否美化属性值 默认：true
                remove: true //是否去掉不必要的前缀 默认：true
            }))
            .on('error', function (error) {
                log(error.message);
                console.log(error.message);
            })
            /*
            .on('error', function (error) {
                log(error.message);
                console.log(error.message);
            })*/
            .pipe(gulp.dest(paths.dist.css))
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

    //编译 sass
    /*function compileSass(cb) {
        gulp.src(paths.src.sass)
            .pipe(sass())
            .on('error', function (error) {
                console.log(error.message);
                log(error.message);
            })
            .pipe(lazyImageCSS({imagePath: lazyDir}))
            .pipe(tmtsprite({margin: 4}))
            .pipe(gulpif(condition, gulp.dest(paths.tmp.sprite), gulp.dest(paths.tmp.css)))
            .on('data', function () {
            })
            .on('end', function () {
                console.log('compileSass success.');
                log('compileSass success.');
                cb && cb();
            })
    }*/

    //编译 js
    function compileJs(cb) {
        var myConfig = Object.create(webpackConfig);
        myConfig.entry = path.join(projectPath, './src/js/'+projectName+'.js')
        myConfig.output.path = path.join(projectPath, './dist/js/')
        myConfig.output.filename  = projectName+'.js';
        myConfig.resolveLoader = { modules: [path.join(__dirname, "../../node_modules")] };//必须指定WEBPACK使用的包路径，不然打包后webpack无法运行
        myConfig.plugins = [
            new webpack.DefinePlugin({
                "process.env": {
                    // This has effect on the react lib size
                    "NODE_ENV": JSON.stringify("production")
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: true,//这里的soucemap 不能少，可以在线上生成soucemap文件，便于调试
                mangle: true
            })
        ];
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

    //图片压缩
    function imageminImg(cb) {
        gulp.src(paths.src.img)
            .pipe(imagemin())
            .on('error', function (error) {
                log(error.message);
                console.log(error.message);
            })
            .pipe(gulp.dest(paths.dist.img))
            .on('end', function () {
                console.log('imageminImg success.');
                log('imageminImg success.');
                cb && cb();
            });
    }

    //复制媒体文件
    function copyMedia(cb) {
        gulp.src(paths.src.media, {base: paths.src.dir})
            .pipe(gulp.dest(paths.dist.dir))
            .on('end', function () {
                console.log('copyMedia success.');
                log('copyMedia success.');
                cb && cb();
            });
    }


    //html 编译
    function compileHtml(cb) {
        gulp.src(paths.src.html)
            .pipe(gulpif(CDN!="",replace('../img', CDN)))
            .pipe(ejs(ejshelper()))
            /*.pipe(gulpif(
                config.supportREM,
                posthtml(
                    posthtmlPx2rem({
                        rootValue: 75,
                        minPixelValue: 2
                    })
                ))
            )*/
            .pipe(gulp.dest(paths.dist.html))
            .on('end', function () {
                console.log('compileHtml success.');
                log('compileHtml success.');
                cb && cb();
            });
    }

    //新文件名(md5)
    /*function reversion(cb) {
        var revAll = new RevAll({
            fileNameManifest: 'manifest.json',
            dontRenameFile: ['.html', '.php']
        });

        if (config['reversion']) {
            gulp.src(paths.tmp.dirAll)
                .pipe(revAll.revision())
                .pipe(gulp.dest(paths.tmp.dir))
                .pipe(revDel({
                    exclude: /(.html|.htm)$/
                }))
                .pipe(revAll.manifestFile())
                .pipe(gulp.dest(paths.tmp.dir))
                .on('end', function () {
                    console.log('reversion success.');
                    log('reversion success.');
                    cb && cb();
                })
        } else {
            cb && cb();
        }
    }*/

    //webp 编译
    function supportWebp(cb) {
        if (config['supportWebp']) {
            webp(projectPath, cb);
        } else {
            cb();
        }
    }

    // 清除 tmp 目录
    function delTmp(cb) {
        del(paths.tmp.dir, {force: true}).then(function (delpath) {
            cb();
        })
    }

    function findChanged(cb) {

        if (!config['supportChanged']) {
            gulp.src(paths.tmp.dirAll, {base: paths.tmp.dir})
                .pipe(gulp.dest(paths.dist.dir))
                .on('end', function () {
                    delTmp(cb);
                })
        } else {
            var diff = changed(paths.tmp.dir);
            var tmpSrc = [];

            if (!_.isEmpty(diff)) {

                //如果有reversion
                if (config['reversion'] && config['reversion']['available']) {
                    var keys = _.keys(diff);

                    //先取得 reversion 生成的manifest.json
                    var reversionManifest = require(path.join(paths.tmp.dir, './manifest.json'));

                    if (reversionManifest) {
                        reversionManifest = _.invert(reversionManifest);

                        reversionManifest = _.pick(reversionManifest, keys);

                        reversionManifest = _.invert(reversionManifest);

                        _.forEach(reversionManifest, function (item, index) {
                            tmpSrc.push(path.join(paths.tmp.dir, item));
                            console.log('[changed:] ' + util.colors.blue(index));
                        });

                        //将新的 manifest.json 保存
                        fs.writeFileSync(path.join(paths.tmp.dir, './manifest.json'), JSON.stringify(reversionManifest));

                        tmpSrc.push(path.join(paths.tmp.dir, './manifest.json'));
                    }
                } else {
                    _.forEach(diff, function (item, index) {
                        tmpSrc.push(path.join(paths.tmp.dir, index));
                        console.log('[changed:] ' + util.colors.blue(index));
                    });
                }

                gulp.src(tmpSrc, {base: paths.tmp.dir})
                    .pipe(gulp.dest(paths.dist.dir))
                    .on('end', function () {
                        delTmp(cb);
                    })

            } else {
                console.log('Nothing changed!');
                delTmp(cb);
            }
        }

    }

    async.series([
        /**
         * 先删除目标目录,保证最新
         * @param next
         */
        function (next) {
            delDist(next);
        },
        function (next) {
            compileLess(next);
        },
        /*function (next) {
            compileSass(next);
        },*/
        function (next) {
            async.parallel([
                function (cb) {
                    imageminImg(cb);
                },
                function (cb) {
                    copyMedia(cb);
                }
            ], function (error) {
                if (error) {
                    throw new Error(error);
                }
                next();
            })
        },
        function (next) {
            compileJs(next);
        },
        function (next) {
            compileHtml(next);
        },
        /*function (next) {
            reversion(next);
        },*/
        function (next) {
            supportWebp(next);
        }/*,
        function (next) {
            findChanged(next);
        }*/
    ], function (error) {
        if (error) {
            throw new Error(error);
        }

        callback && callback();
    });

}

module.exports = dist;
