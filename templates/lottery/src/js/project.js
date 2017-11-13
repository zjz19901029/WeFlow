$(function() {
    const CONFIG = require('./config.js');
    const HOST = CONFIG.test;

    WeUI.Config.wx_share_host = HOST.wx_share;
    WeUI.Config.login.wx_oauth = HOST.wx_oauth;
    WeUI.Config.login.wx_login = HOST.wx_login;
    WeUI.Config.hotel.app.href_v2 = HOST.hotelDetail;
    WeUI.Config.hotellist.app.href_v2 = HOST.hotelList;
    /**
     * app标题栏配置
     */
    WeUI.Util.setPageInfo({//设置分享
        title: document.title,
        shareTitle: document.title,
        shareDesc: '',
        shareImg: HOST.shareimg + '/share.jpg',
        webUrl: window.location.href,
        canShare: true
    });
    if (WeUI.Util.getClientType() == "m") {
        var url = window.location.href;
        window.location.href = 'botaoota://hybridBridgeV2?hybrid_host_path=' + url;
    }

    const MSG = {
        weixin: '请点击右上角，在浏览器打开本页面~',
        notApp: '请最新版铂涛旅行App打开本页面~',
        noChance: '很遗憾，已经没有抽奖机会了~',
        expire: '<span>已过期</span>2017/5/25晚上23:59为最后抽奖时间',
        timeOut: '<span>网络异常</span>请稍后再试~',
        prize1: '<span>恭喜你抽中尼斯正版围巾1条！</span>客服将在5月26日联系你，请保持手机畅通。',
        prize2: '<span>恭喜您获得50积分</span>',
        prize3: '<span>恭喜您获得20积分</span>',
        prize4: '<span>恭喜您获得12积分</span>',
        prize5: '<span>感谢支持</span>还差一点点就中奖了~'
    }

    if (wehotelSDK.appVersion) {// 兼容V1 V2
        WeUI.Util.getToken(function(_token){
            TOKEN = _token;
            initLottery();
        });
    } else if(WeUI.Util.getClientType() == "wx"){
        showModal(MSG.weixin);
    }else{
        var url = window.location.href;
        location.href = 'botaoota://hybridBridgeV2?hybrid_host_path=' + url;
    }
    var freeTime;//抽奖次数
    var sum = 10;//总共奖项
    var loterry;//中奖的index
    var minRotate = 8*360;//最少转动角度
    var rotate = 0;//当前转动的角度
    var duration = 6;//转动时间
    var TOKEN;
    function bindEvent(){
        // 抽奖
        $(document).on('tap', '.center', function(evt){
            if(!TOKEN){
                WeUI.Util.login(function(_token){
                    TOKEN = _token;
                    initLottery();
                });
                return;
            }
            // new Date(年, 月(0-11), 日, 时, 分, 秒)
            if( Date.now() > (new Date(2017, 4, 25, 23, 59, 59)) ){
                showModal(MSG.expire);
                return;
            }

            if(!freeTime){
                showModal(MSG.noChance);
                return;
            }
            
            $(this).addClass("disabled");
            $.ajax({
                type: 'POST',
                url: CONFIG.api + '/vipRaffle',
                data:{
                  token: TOKEN
                },
                dataType: 'json',
                success: function (data) {
                    if (data.status == 200) {
                        freeTime  = data.freeTimes;
                        $(".lasttimes span").text(freeTime);
                        var prizesId = data.prizesId;
                        lotteryAnimate(prizesId);
                    }else {
                        showModal(data.reason);
                    }
                },
                error:function(){
                    showModal(MSG.timeOut);
                }
            });
        })
    };

    function lotteryAnimate(loterry){
        $(".center").addClass("disabled");
        rotate = rotate-rotate%360+minRotate+360-(loterry-1)*360/sum;//需要转动的角度
        $(".circle").css("transform","rotate("+rotate+"deg)");
        $(".circle").css("transition-duration",duration+"s");
        $("body").addClass("playing");
        setTimeout(function(){
            if([1,4].indexOf(loterry)>=0){ // 一等奖
                showModal(MSG.prize1);
            }else if([2].indexOf(loterry)>=0){ // 二等奖
                showModal(MSG.prize2);
            }else if([6].indexOf(loterry)>=0){ // 三等奖
                showModal(MSG.prize3);
            }else if([7].indexOf(loterry)>=0){ // 三等奖
                showModal(MSG.prize4);
            }else{ // 谢谢参与
                showModal(MSG.prize5);
            }
            $(".center").removeClass("disabled");
            $("body").removeClass("playing");
        },duration*1000);
    }

    function showModal(txt){
        if($(".modal").hasClass('hidden')){
            $(".modal div").html(txt);
            $(".modal, .mask").removeClass('hidden');
            $(".center").removeClass("disabled");
        }
    }

    function hideModal(){
        if(!$(".modal").hasClass('hidden')){
            $(".modal, .mask").addClass('hidden');
        }
    }

    $(".modal button, .modal .close, .mask").on("tap",function(evt){
        evt.preventDefault();
        evt.stopPropagation();

        hideModal();
    });

    // 获取奖品信息
    function initLottery(){
        $.ajax({
            type: 'POST',
            url: CONFIG.api + '/init',
            data: {
                token: TOKEN
            },
            dataType: 'json',
            success: function (data) {
                if (data.status == 200) {
                    freeTime = data.freeTimes;
                    $(".lasttimes span").text(freeTime);
                    if (data.vipWinPrize) {
                        var html = '',
                            listWinPrize = data.vipWinPrize;
                        for (var i in listWinPrize) {
                          html += '<span>恭喜' + listWinPrize[i].memberName + '&nbsp;抽中&nbsp;<em>' + listWinPrize[i].prizeName + '</em></span>';
                        }
                        $(".marquee").html('<p>'+html+'</p>');
                    }
                    bindEvent();
                }
            }
        });
    }

})
