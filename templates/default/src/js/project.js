$(function() {

    const CONFIG = require('./config.js');
    const HOST = CONFIG.test;
    WeUI.Config.wx_share_host = HOST.wx_share;
    WeUI.Config.login.wx_oauth = HOST.wx_oauth;
    WeUI.Config.login.wx_login = HOST.wx_login;

    WeUI.Config.hotel.app.href_v2 = HOST.hotelDetail;
    WeUI.Config.hotellist.app.href_v2 = HOST.hotelList;
    
    WeUI.Util.setPageInfo({//设置分享
        title: document.title,
        shareTitle: document.title,
        shareDesc: '',
        shareImg: HOST.shareimg + '/share.jpg',
        webUrl: window.location.href,
        canShare: true
    });
    if(WeUI.Util.getClientType() != "wx"  || WeUI.Util.getClientType() == "app"){
        var url = window.location.href;
        location.href = 'botaoota://hybridBridgeV2?hybrid_host_path=' + url;
    }
});