"use strict";

const path = require('path');
const fs = require('fs');

class Common {

}

Common.NAME = 'WeFlow';
Common.ROOT = path.join(__dirname, '../');
Common.WORKSPACE = `${Common.NAME}_workspace`;
Common.CONFIGNAME = 'weflow.config.json';
Common.CONFIGPATH = path.join(__dirname, '../', Common.CONFIGNAME);
Common.PLATFORM = process.platform;
Common.DEFAULT_PATH = Common.PLATFORM === 'win32' ? 'desktop' : 'home';
Common.TEMPLATE_DIR = path.resolve(path.join(__dirname, '../templates'));
Common.TEMPLATE_PROJECT = path.resolve(path.join(__dirname, '../templates/default.zip'));
Common.TEMPLATE_EXAMPLE = path.resolve(path.join(__dirname, '../templates/example.zip'));
Common.EXAMPLE_NAME = 'WeFlow-example';
Common.CHECKURL = 'https://raw.githubusercontent.com/weixin/WeFlow/master/package.json';
Common.DOWNLOADURL = 'https://github.com/weixin/WeFlow/releases';

Common.requireUncached = function (module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

Common.fileExist = function (filePath) {
    try {
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        } else {
            throw new Error(err);
        }
    }
};

Common.dirExist = function (dirPath) {
    try {
        var stat = fs.statSync(dirPath);
        if (stat.isDirectory()) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            return false;
        } else {
            throw new Error(err);
        }
    }
}

Common.getStorage = function () {
    let storage = window.localStorage;

    if (storage.getItem(Common.NAME)) {
        return JSON.parse(storage.getItem(Common.NAME));
    } else {
        return false;
    }
};

Common.setStorage = function (storage,storefile = true) {
    localStorage.setItem(Common.NAME, JSON.stringify(storage));
    if(!storefile){return;}
    fs.writeFile(path.join(storage.workspace,Common.NAME+'.json'), JSON.stringify(storage), function(err){
        if(err){
            alert(err)
        }
    })
};

Common.resetStorage = function () {
    let storage = localStorage.getItem(Common.NAME);

    if (storage) {
        storage.removeItem(Common.NAME);
    }
};

module.exports = Common;
