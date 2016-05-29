"use strict";

const path = nodeRequire('path');
const fs = nodeRequire('fs');
const childProcess = nodeRequire('child_process');
const del = nodeRequire('del');
const vfs = nodeRequire('vinyl-fs');
const extract = nodeRequire('extract-zip');
const electron = nodeRequire('electron');
const _ = nodeRequire('lodash');
const async = nodeRequire('async');
const remote = electron.remote;
const shell = electron.shell;
const createDev = nodeRequire(path.join(__dirname, './src/createDev'));
const dist = nodeRequire(path.join(__dirname, './src/_tasks/dist.js'));
const zip = nodeRequire(path.join(__dirname, './src/_tasks/zip.js'));
const ftp = nodeRequire(path.join(__dirname, './src/_tasks/ftp.js'));
const Common = nodeRequire(path.join(__dirname, './src/common'));

//变量声明
let $welcome = $('#js-welcome');
let $openProject = $('#js-open-project');
let $newProject = $('#js-new-project');
let $projectList = $('#js-project-list');
let $delProject = $('#js-del-project');
let $buildDevButton = $('#js-build-dev');
let $logButton = $('#js-log-button');
let $log = $('#js-log');
let $logContent = $log.find('.logs__inner');
let $cleanLog = $('#js-clean-log');
let $settingButton = $('#js-setting-button');
let $settingClose = $('#js-setting-close');
let $formWorkspace = $('#js-form-workspace');
let $setting = $('#js-setting');
let $workspaceSection = $('#js-workspace');
let $delProjectBtn = $('#js-del-project-btn');
let $logStatus = $('#js-logs-status');
let changeTimer = null;
let $curProject = null;
let once = false;
let curConfigPath = Common.CONFIGPATH;
let config = nodeRequire(curConfigPath);
let FinderTitle = Common.PLATFORM === 'win32' ? '在 文件夹 中查看' : '在 Finder 中查看';

//初始化
init();

//如果是第一次打开,设置数据并存储
//其他则直接初始化数据
function init() {

    let storage = Common.getStorage();

    if (!storage) {

        $welcome.removeClass('hide');

        storage = {};
        storage.name = Common.NAME;

        let workspace = path.join(remote.app.getPath(Common.DEFAULT_PATH), Common.WORKSPACE);

        $formWorkspace.val(workspace);

        storage.workspace = workspace;
        Common.setStorage(storage)
    } else {
        initData();
    }

}

//初始化数据
function initData() {
    let storage = Common.getStorage();
    let title = '';

    if (storage) {
        if (storage['workspace']) {
            $formWorkspace.val(storage['workspace']);
        }

        if (!_.isEmpty(storage['projects'])) {
            let html = '';

            for (let i in storage['projects']) {

                html += `<li class="projects__list-item" data-project="${i}" title="${storage['projects'][i]['path']}">
                              <span class="icon icon-finder" data-finder="true" title="${FinderTitle}"></span>
                              <div class="projects__list-content">
                                  <span class="projects__name">${i}</span>
                                  <div class="projects__path">${storage['projects'][i]['path']}</div>
                              </div>
                              <a href="javascript:;" class="icon icon-info projects__info"></a>
                        </li>`;
            }

            $projectList.html(html);

            //当前活动项目
            $curProject = $projectList.find('.projects__list-item').eq(0);
            $curProject.addClass('projects__list-item_current');

        } else {
            $welcome.removeClass('hide');
        }
    }
}


//打开项目
$openProject.on('change', function () {
    if (this && this.files.length) {
        let projectPath = this.files[0].path;

        openProject(projectPath);

    } else {
        alert('选择目录出错,请重新选择!');
    }
});

$projectList[0].ondragover = function () {
    return false;
};
$projectList[0].ondragleave = $projectList[0].ondragend = function () {
    return false;
};
$projectList[0].ondrop = function (e) {
    e.preventDefault();
    var file = e.dataTransfer.files[0];

    var stat = fs.statSync(file.path);
    if (stat.isDirectory()) {
        openProject(file.path);
    }
    return false;
};

function openProject(projectPath) {

    //打开项目的时候,需要创建 dev.js 的执行文件
    createDev(projectPath, function (projectPath, devPath) {
        let projectName = path.basename(projectPath);
        let storage = Common.getStorage();

        if (storage && storage['workspace']) {
            if (!storage['projects']) {
                storage['projects'] = {};
            }

            if (storage['projects'][projectName]) {
                alert('项目已存在');
            } else {
                storage['projects'][projectName] = {};
                storage['projects'][projectName]['path'] = projectPath;
                storage['projects'][projectName]['devPath'] = devPath;
                Common.setStorage(storage);

                //插入打开的项目
                insertOpenProject(projectPath);
            }
        }
    });

}

//插入打开的项目
function insertOpenProject(projectPath) {

    if (!$welcome.hasClass('hide')) {
        $welcome.addClass('hide');
    }

    //插入节点
    let projectName = path.basename(projectPath);

    let $projectHtml = $(`<li class="projects__list-item" data-project="${projectName}" title="${projectPath}">
                              <span class="icon icon-finder" data-finder="true" title="${FinderTitle}"></span>
                              <div class="projects__list-content">
                                  <span class="projects__name">${projectName}</span>
                                  <div class="projects__path">${projectPath}</div>
                              </div>
                              <a href="javascript:;" class="icon icon-info projects__info"></a>
                        </li>`);

    $projectList.append($projectHtml);

    $projectList.scrollTop($projectList.get(0).scrollHeight);

    $projectHtml.trigger('click');

    //只有在节点成功插入了才保存进 storage
    let storage = Common.getStorage();

    if (storage) {
        if (!storage['projects']) {
            storage['projects'] = {};
        }
        if (!storage['projects'][projectName]) {
            storage['projects'][projectName] = {};
        }
        storage['projects'][projectName]['path'] = projectPath;

        Common.setStorage(storage);
    }

}


//删除项目
$delProject.on('click', function () {
    delProject();
});
$delProjectBtn.on('click', function () {
    delProject(function () {
        $setting.addClass('hide');
    });
});

function delProject(cb) {

    if(!$curProject.length){
        return;
    }

    let projectName = $curProject.data('project');
    let index = $curProject.index();

    $curProject.remove();

    if (index > 0) {
        $curProject = $('.projects__list-item').eq(index - 1);
    } else {
        $curProject = $('.projects__list-item').eq(index);
    }

    $curProject.trigger('click');

    killChildProcess(projectName);
    delDevFile(projectName);

    let storage = Common.getStorage();

    if (storage && storage['projects'] && storage['projects'][projectName]) {
        delete storage['projects'][projectName];
        Common.setStorage(storage);
    }

    if (_.isEmpty(storage['projects'])) {
        $welcome.removeClass('hide');
    }

    console.log('del project success.');

    cb && cb();
}

//删除 dev.js
function delDevFile(projectName) {
    let storage = Common.getStorage();

    if (storage && storage['projects'][projectName] && storage['projects'][projectName]['devPath'] && Common.fileExist(storage['projects'][projectName]['devPath'])) {
        fs.unlinkSync(storage['projects'][projectName]['devPath']);
    }
}



//新建项目
$newProject.on('click', function(){
    newProjectFn();
});

function newProjectFn(){
    if (!$welcome.hasClass('hide')) {
        $welcome.addClass('hide');
    }

    let $projectHtml = $(`<li class="projects__list-item" data-project="" title="">
                              <span class="icon icon-finder" data-finder="true" title="${FinderTitle}"></span>
                              <div class="projects__list-content">
                                  <span class="projects__name" contenteditable></span>
                                  <div class="projects__path"></div>
                              </div>
                              <a href="javascript:;" class="icon icon-info projects__info"></a>
                        </li>`);

    $projectList.append($projectHtml);

    $projectList.scrollTop($projectList.get(0).scrollHeight);

    let $input = $projectHtml.find('.projects__name');

    $projectHtml.trigger('click');

    $input.get(0).focus();
    $input.hover();

    editName($projectHtml, $input);
}

function editName($project, $input) {
    let text;
    let hasText = false;

    $input.keypress(function (event) {
            let $this = $(this);
            text = $.trim($this.text());
            if (event.which === 13 && !hasText) {
                if (text !== '') {
                    setProjectInfo($project, $this, text);

                    hasText = true;
                } else {
                    alert('请输入项目名');
                    this.focus();
                }
            }
        })
        .blur(function () {

            if (!hasText) {
                let $this = $(this);
                text = $.trim($this.text());
                if (text !== '') {
                    setProjectInfo($project, $this, text);

                    hasText = true;
                } else {
                    alert('请输入项目名');
                    this.focus();
                }
            }
        });
}

//设置新建项目信息
function setProjectInfo($project, $input, text) {
    let storage = Common.getStorage();
    let projectPath;

    if (storage && storage['workspace']) {
        projectPath = path.join(storage['workspace'], text);

        if (!Common.dirExist(projectPath)) {
            $input.attr('contenteditable', false);
            $curProject = $project.remove();

            newProject(projectPath, function (projectPath, devPath) {
                newProjectReply(projectPath, devPath);
            });

        } else {
            alert(text + ' 项目已存在');
            $input.text('');
            editName($project, $input);
        }
    }

}

function newProject(projectPath, callback){
    let workspace = path.dirname(projectPath);

    //先判断一下工作区是否存在
    if(!Common.dirExist(workspace)){
        try{
            fs.mkdirSync(path.join(workspace));
        }catch (err){
            throw new Error(err);
        }
    }

    //创建项目目录
    if(Common.dirExist(projectPath)){
        throw new Error('project already exists');
    }else{
        try{
            fs.mkdirSync(path.join(projectPath));
        }catch (err){
            throw new Error(err);
        }
    }

    extract(Common.TEMPLAGE_PROJECT, {dir: projectPath}, function (err) {
        if(err){
            throw new Error(err);
        }

        //生成 dev task
        createDev(projectPath, function(projectPath, devPath){
            callback && callback(projectPath, devPath);
        });

    });
}

function newProjectReply(projectPath, devPath){
    let projectName = path.basename(projectPath);
    let storage = Common.getStorage();

    if (storage && storage['workspace']) {
        if (!storage['projects']) {
            storage['projects'] = {};
        }

        if (storage['projects'][projectName]) {
            alert('项目已存在');
        } else {
            storage['projects'][projectName] = {};
            storage['projects'][projectName]['path'] = projectPath;
            storage['projects'][projectName]['devPath'] = devPath;
            Common.setStorage(storage);

            $curProject.data('project', projectName);
            $curProject.attr('title', projectPath);
            $curProject.find('.projects__path').text(projectPath);

            $projectList.append($curProject);
        }

        $projectList.scrollTop($projectList.get(0).scrollHeight);
    }
}

//绑定任务按钮事件
$('#js-tasks').find('.tasks__button').on('click', function () {

    let taskName = $(this).data('task');

    taskHandler(taskName);

});

function taskHandler(taskName){

    let projectName = $curProject.data('project');

    if (taskName === 'dev') {

        if ($buildDevButton.data('devwatch')) {
            $logStatus.text('running…');
            killChildProcess(projectName);
            setNormal();
        } else {
            let storage = Common.getStorage();
            if (storage && storage['projects'] && storage['projects'][projectName]) {
                runDevTask(storage['projects'][projectName]['devPath']);
            }
        }

    } else {
        let storage = Common.getStorage();
        if (storage && storage['projects'] && storage['projects'][projectName]) {
            runTask(storage['projects'][projectName]['path'], taskName);
        }

        $logStatus.text('running…');
    }
}

function runDevTask(devPath){
    let child = childProcess.fork(devPath, {silent: true});

    child.stdout.on('data', function (data) {
        logReply(data.toString());
    });

    child.stderr.on('data', function (data) {
        logReply(data.toString());
    });

    child.on('close', function (code) {
        if (code !== 0) {
            logReply(`child process exited with code ${code}`);
        }
    });

    let storage = Common.getStorage();
    let projectName = $curProject.data('project');

    if (storage && storage['projects'] && storage['projects'][projectName]) {
        storage['projects'][projectName]['pid'] = child.pid;
        Common.setStorage(storage);

        setWatching();

        $logStatus.text('Done');
    }

}

function runTask(projectPath, taskName){

    if(!taskName){
        taskName = projectPath;
        projectPath = $curProject.attr('title');
    }

    if (taskName === 'dist') {
        dist(projectPath, function (data) {
            logReply(data);
        }, function () {
            $logStatus.text('Done');
        });
    }

    if (taskName === 'zip') {
        dist(projectPath, function (data) {
            logReply(data);
        }, function () {
            zip(projectPath, function (data) {
                logReply(data);
            }, function () {
                $logStatus.text('Done');
            });
        });
    }

    if (taskName === 'ftp') {
        dist(projectPath, function (data) {
            logReply(data);
        }, function () {
            ftp(projectPath, function (data) {
                logReply(data);
            }, function () {
                $logStatus.text('Done');
            })
        })
    }
}

function logReply(data){
    let D = new Date();
    let h = D.getHours();
    let m = D.getMinutes();
    let s = D.getSeconds();

    $logContent.append(`<div><span class="logs__time">[${h}:${m}:${s}]</span> ${data}</div>`);
    $logContent.scrollTop($logContent.get(0).scrollHeight);
}


//全局设置和项目设置
//点击全局设置按钮的时候
//1. 初始化数据
//2. 显示设置面板
//3. 显示 workspace 设置区域
//4. 隐藏 删除项目 按钮
$settingButton.on('click', function () {
    settingFn();
});

function settingFn(){
    curConfigPath = Common.CONFIGPATH;
    initConfig();

    if ($setting.hasClass('hide')) {
        $setting.removeClass('hide');
        $workspaceSection.removeClass('hide');
        $delProjectBtn.addClass('hide');
    } else {
        $setting.addClass('hide');
    }
}

//关闭设置面板
$settingClose.on('click', function () {
    $setting.addClass('hide');
});

$setting.on('change', 'input', function () {

    clearTimeout(changeTimer);

    let $this = $(this);

    if ($this.data('workspace')) {

        let storage = Common.getStorage();
        let originWorkspace = storage.workspace;

        storage.workspace = $.trim($this.val());

        vfs.src(path.join(originWorkspace, '/**/*'))
            .pipe(vfs.dest(storage.workspace))
            .on('end', function () {

                async.series([
                    function (next) {
                        del([originWorkspace, Common.TEMP_DEV_PATH + '/**/*'], {force: true}).then(function () {
                            next();
                        })
                    },
                    function (next) {
                        //更新 localstorage
                        let projects = storage.projects;

                        async.eachSeries(projects, function (project, callback) {
                            project.path = project.path.replace(originWorkspace, storage.workspace);
                            createDev(project.path, function (projectPath, devPath) {
                                project.devPath = devPath;
                                console.log(project.path + ' create success.');

                                callback();
                            });
                        }, function () {
                            Common.setStorage(storage);
                            next();
                        });
                    }
                ], function (error) {
                    if (error) {
                        throw new Error(error);
                    }

                    //更新 dom
                    initData();

                    console.log('workspace update success.');

                });

            });

    } else {
        updateConfig($this);
    }
});

//初始化设置面板数据
//重要的是每次都需要加载特定设置文件,如区分出是 全局, 或是 项目设置, 用一个全局变量 curConfigPath 保存着
function initConfig() {

    //需要去缓存加载
    config = Common.requireUncached(curConfigPath);

    for (let i in config) {

        if (i === 'ftp') {
            for (var j in config['ftp']) {
                let $el = $(`input[name=ftp-${j}]`);

                if ($el && $el.length) {
                    if ($el.attr('type') === 'text') {
                        $el.val(config['ftp'][j]);
                    } else {
                        $el.prop('checked', config['ftp'][j]);
                    }
                }
            }
        }

        let $el = $(`input[name=${i}]`);

        if ($el && $el.length) {
            if ($el.attr('type') === 'text') {
                $el.val(config[i]);
            } else {
                $el.prop('checked', config[i]);
            }
        }
    }
}

//更新配置
//为了不频繁更新,每次变动后隔1500毫秒后更新
function updateConfig($this) {
    let name = $this.attr('name');
    let val = $.trim($this.val());
    let checked = $this.prop('checked');
    let type = $this.attr('type');

    if (!val) {
        return;
    }

    let nameArr = name.split('-');
    let pname = nameArr[0];
    let cname = nameArr[1];

    if (cname) {
        config[pname][cname] = type === 'text' ? val : checked;
    } else {
        config[pname] = type === 'text' ? val : checked;
    }

    //写入configPath
    changeTimer = setTimeout(function () {
        fs.writeFile(curConfigPath, JSON.stringify(config), function (err) {
            if (err) {
                throw new Error(err);
            }

            console.log('update config success.');
        })
    }, 1500);
}

//点击项目信息的时候
//1.先判断一下项目配置文件是否存在
//2.如果不存在则复制一份全局的过去
//3.初始化设置面板数据
//4.隐藏工作区设置
//5.显示 项目删除 按钮
//6.显示设置面板
$projectList.on('click', '.projects__info', function () {
    settingCurrentProject();
});

function settingCurrentProject() {
    let projectPath = $curProject.attr('title');
    curConfigPath = path.join(projectPath, Common.CONFIGNAME);

    //如果当前项目下的 config 不存在的时候,先挪过去
    if (!Common.fileExist(curConfigPath)) {
        vfs.src(Common.CONFIGPATH)
            .pipe(vfs.dest(projectPath))
            .on('end', function () {
                console.log('create weflow.config.json success');
                initConfig();
            });
    } else {
        initConfig();
    }

    $workspaceSection.addClass('hide');
    $delProjectBtn.removeClass('hide');
    $setting.removeClass('hide');
}


//log 切换
$logButton.on('click', function () {
    let $this = $(this);

    if ($this.hasClass('icon-log_green')) {
        $this.removeClass('icon-log_green');
    } else {
        $this.addClass('icon-log_green');
    }

    if ($log.hasClass('logs_show')) {
        $log.removeClass('logs_show');
        $projectList.removeClass('projects__list_high');
    } else {
        $log.addClass('logs_show');
        $projectList.addClass('projects__list_high');
    }
});

//项目列表绑定点击事件
$projectList.on('click', '.projects__list-item', function () {
    let $this = $(this);
    $('.projects__list-item').removeClass('projects__list-item_current');
    $this.addClass('projects__list-item_current');
    $curProject = $this;

    if ($this.data('watch')) {
        setWatching();
    } else {
        setNormal();
    }

});

function setNormal() {
    $buildDevButton.removeClass('tasks__button_watching');
    $buildDevButton.text('开发');
    $buildDevButton.data('devwatch', false);

    $curProject.removeClass('projects__list-item_watching');
    $curProject.data('watch', false);
}

function setWatching() {
    $buildDevButton.addClass('tasks__button_watching');
    $buildDevButton.text('监听中…');
    $buildDevButton.data('devwatch', true);

    $curProject.addClass('projects__list-item_watching');
    $curProject.data('watch', true);
}

$buildDevButton.hover(function () {
    let $this = $(this);
    if ($this.hasClass('tasks__button_watching')) {
        $this.text('停止');
    }
}, function () {
    let $this = $(this);
    if ($this.hasClass('tasks__button_watching')) {
        $this.text('监听中...');
    }
});



//结束子进程
function killChildProcess(projectName) {
    let storage = Common.getStorage();

    if (storage && storage['projects'][projectName] && storage['projects'][projectName]['pid']) {

        try {
            process.kill(storage['projects'][projectName]['pid']);
        } catch (e) {
            console.log('pid not found');
        }

        storage['projects'][projectName]['pid'] = 0;
        Common.setStorage(storage);

        $logStatus.text('Done');
    }
}




function showAbout() {
    const BrowserWindow = remote.BrowserWindow;

    let win = new BrowserWindow({
        width: 360,
        height: 400,
        resizable: false,
        title: '关于'
    });

    let aboutPath = 'file://' + __dirname + '/about.html';
    win.loadURL(aboutPath);

    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

//打开项目所在目录
$projectList.on('click', '[data-finder=true]', function () {
    let $this = $(this);
    let projectPath = $this.parents('.projects__list-item').attr('title');

    if (projectPath) {
        shell.showItemInFolder(projectPath);
    }

});

//清除 log 信息
$cleanLog.on('click', function () {
    $logContent.html('');
});
