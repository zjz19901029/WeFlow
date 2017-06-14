$(function() {

    const CONFIG = require('./config.js');
    const HOST = CONFIG.test;
    WeUI.Config.wx_share_host = HOST.wx_share;
    WeUI.Config.login.wx_oauth = HOST.wx_oauth;
    WeUI.Config.login.wx_login = HOST.wx_login;
    
    var token;
    WeUI.Util.setPageInfo({//设置分享
        title: document.title,
        shareTitle: document.title,
        shareDesc: '先充值再下单，送酒+景百元大礼包！',
        shareImg: HOST.shareimg + '/share.jpg',
        webUrl: window.location.href,
        canShare: true
    });

    WeUI.Util.getToken(function(_token){
        token = _token;
        render && render(_token, WeUI.Util.getClientType());
    },WeUI.Util.getClientType() == "wx")

    /**
     * 数据渲染
     */
    function render(token, type){
        var lv = 1;

        if(token && type){
            $.ajax({
                type: 'POST',
                url: HOST.host + CONFIG[type].api,
                data: {
                    token: token
                },
                dataType: 'json',
                success: function(res){
                    if(res && res.memberTypeCode){
                        switch (parseInt(res.memberTypeCode)) {
                            case 0:
                                // if(!fnisWeixin()){
                                    lv = 0;
                                // }
                                break;
                            case 2:
                                lv = 2;
                                break;
                            case 5:
                            case 6:
                                lv = 3;
                                break;
                        }
                    }

                    compile(lv, type);
                },
                fail: function(res){
                    console.error(res)
                    compile(lv, type);
                }
            })
        }else{
            compile(lv, type);
        }
    }

    function compile(level, type){
        var data = [];

        if(type == "wx"){
            data = require('./wx.json');
        }else{
            data = require('./app.json');
        }

        var tpl = require('./content.ejs');
        var html = tpl({ data: data[level], api: CONFIG[(type!="m"?type:'app')].gift , imgPrefix: HOST.img });
        $('.wrapper').html(html);

        if(WeUI.Util.getClientType() == "m"){
            $('.a-btn').attr('href', CONFIG.download).text('立即下载App');
        }else if(!token){
            $('.a-btn').attr('href', CONFIG.app.login);
        }
    }

    $(document).on('tap', '.collapse', function(evt){
        $(this).toggleClass('collapse-hide').toggleClass('collapse-show');
        $('.list').toggleClass('collapse-hide');
    })

})
