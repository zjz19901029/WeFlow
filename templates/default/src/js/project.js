$(function() {

    const CONFIG = require('./config.js');
    const HOST = CONFIG.test;
    WeUI.Config.wx_share_host = HOST.wx_share;
    WeUI.Config.login.wx_oauth = HOST.wx_oauth;
    WeUI.Config.login.wx_login = HOST.wx_login;
    
    WeUI.Util.setPageInfo({//设置分享
        title: document.title,
        shareTitle: document.title,
        shareDesc: '',
        shareImg: HOST.shareimg + '/share.jpg',
        webUrl: window.location.href,
        canShare: true
    });
});