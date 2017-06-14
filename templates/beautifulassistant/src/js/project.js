$(function() {

    const CONFIG = require('./config.js');
    const HOST = CONFIG.test;

    WeUI.Config.wx_share_host = HOST.wx_share;
    WeUI.Config.login.wx_oauth = HOST.wx_oauth;
    WeUI.Config.login.wx_login = HOST.wx_login;
    /**
     * app标题栏配置
     */
    WeUI.Util.setPageInfo({//设置分享
        title: document.title,
        shareTitle: document.title,
        shareDesc: '花样姐姐约你去洛阳赏牡丹',
        shareImg: HOST.shareimg + '/share.jpg',
        webUrl: window.location.href,
        canShare: true
    });

    const data = {
        id: '2540', // 酒店id
        series: 19, // 第n期 
        photo: 7    // 轮播图数量
    };
    render(WeUI.Util.getClientType());

    function render(type){
        var tpl = require('./content.ejs');
        var html = tpl({ data: data, imgPrefix: HOST.img, app: WeUI.Util.getClientType()=="app" });
        $('.wrapper').html(html);

        $("img.lazy").lazyload({ effect: "fadeIn", threshold: 50, container: $(".wrapper") });

        jQuery('#photos').flickity({
            cellAlign: 'center',
            prevNextButtons: true,
            autoPlay: false,
            wrapAround: true,
            lazyLoad: 1,
            pageDots: false,
            draggable: false,
            resizeBound: true
        });
        jQuery('#preview').flickity({
            cellAlign: 'center',
            prevNextButtons: false,
            autoPlay: false,
            wrapAround: true,
            lazyLoad: 1,
            pageDots: false,
            draggable: true,
            resizeBound: true
        });
    }

    $(document).on('click', '#preview .cell', function(evt){
        var index = parseInt( $(this).data("index") );

        var url = CONFIG.fileOld;

        if(index && index > 11){
            url = CONFIG.file;
        }
        
        url += "/beautifulassistant"+(index?index:'')+".html"+window.location.search;

        if(WeUI.Util.getClientType()=="app"&&!WeUI.Util.isV1()){
            if(index > 11){
                BTSDK.openNewWebView({
                    data:{
                        url: url
                    }
                });
            }else{
                BTSDK.openV1WebView({
                    data:{
                        url: url
                    }
                });
            }

        }else{
            window.location.href = url;
        }
        
    });
})
