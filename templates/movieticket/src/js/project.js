$(function() {
    const data = require("./data.json");
    const CONFIG = require('./config.js');
    const HOST = CONFIG.test;

    WeUI.Config.wx_share_host = HOST.wx_share;
    WeUI.Config.login.wx_oauth = HOST.wx_oauth;
    WeUI.Config.login.wx_login = HOST.wx_login;
    WeUI.Config.hotel.app.href_v2 = HOST.hotelDetail;
    WeUI.Config.hotellist.app.href_v2 = HOST.hotelList;
    /**
     * 分享配置
     */
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

    const ERROR = {
        normal: '我要抢票',
        loading: '抢票中..',
        sessionEnd: '本场票已抢完',
        activityEnd: '活动已结束',
        activityInactive: '活动尚未开始',
        timeout: '系统繁忙',
        invalid: '每人仅有一次机会，不要太贪心哦！',
        success: '恭喜您，成功获得电影票抢票资格！满足活动条件即可获得电影票兑换码抽奖机会。详情请查看抢票页面活动规则。',
        state: '本场抢票正在进行中'
    };
    render(WeUI.Util.getClientType());

    // 链接跳转 默认为<a>的location.href  
    // data-type="v2" v2->v2
    // data-type="v1" v2->v1
    // 使用
    // <a class="link" data-type="v2" href=""></a>
    /*$(document).on('tap', '.link', function(evt){
        var href = $(this).attr("href");
        var url = href;

        if(os === '' && BTSDK.appVersion){                          // app
            evt.preventDefault();

            if($(this).data('type') === 'v2'){                      // v2

                if(href.indexOf("botaoota")>=0){
                    url = href.match(new RegExp("[\?\&]hybrid_path=([^\&]*)(\&?)", "i"))[1];
                    var search = href.split("?")[1].replace(/hybrid_path=([^\&]*)(\&?)/,"");
                    url = CONFIG.host.hotel+url+"?"+search;
                }

                BTSDK.openNewWebView({
                    data: {
                        url: url
                    }
                });

            }else if($(this).data('type') === 'v1'){                // v1

                BTSDK.openV1WebView({
                    data: {
                        url: 'http://trip.plateno.com/actRedirect?page='+url
                    }
                });

            }
        }

    })*/

    /**
     * 请求数据
     * @param  {String} type URL类型 app/weixin/m/pc 与global config对应 某些API的ori字段也需要用到
     */
    function render(type){
        if(type==='app' || type==='wx'){
            WeUI.Util.getToken(function(t){
                getPrice(type, t);
            },true);
        }else{
            return getPrice(type, '');
        }
    }

    function getPrice(type, token){
        $.ajax({
            type: 'POST',
            url: HOST.api + '/hotelInfo/getCommonInnPriceByActName',
            data: {
                token: token,
                ori: type=="wx"?"weixin":type,
                actName: 'marketact:innprize:SmurfsMovieAct'
            },
            dataType: 'json',
            timeout: 30000,
            success: function(res){
                if(res && parseInt(res.status) === 200 && res.map && Array.isArray(res.map) && res.map.length ){
                    
                    for(var i=0, j=0, k=0; i<data.list.length; i++){
                        for(j=0; j<data.list[i].length; j++){
                            for(k=0; k<res.map.length; k++){
                                if(data.list[i][j].id === res.map[k].innId){
                                    data.list[i][j].price = res.map[k].price;
                                    data.list[i][j].origin = res.map[k].rackRate;
                                    data.list[i][j].point = res.map[k].foreReturnPoint;
                                }
                            }
                            
                        }
                    }

                }

                return compile(type);
            },
            fail: function(res){
                console.error(res)
                return compile(type);
            },
            error: function(res){
                console.error(res)
                return compile(type);
            }
        })
    }

    /**
     * 渲染模板
     * @param  {String} type URL类型 app/weixin/m/pc 与global config对应 某些API的ori字段也需要用到
     */
    function compile(type){
        var tpl = require('./content.ejs');
        var html = tpl({ data: data, imgPrefix: HOST.img, list: CONFIG.list });
        $('.wrapper').html(html);
        $(".we-btn").each(function(){
            $(this).button("init")
        });
        // lazyload
        $("img.lazy").lazyload({ effect: "fadeIn", threshold: 50, container: $(".wrapper") });

        return init(type);
    }

    /**
     * 初始化抢票接口
     * @return {String} token
     */
    function init(type){

        $.ajax({
            type: 'POST',
            url: HOST.api + '/movieAct/actInits',
            data: {
                token: ''
            },
            dataType: 'json',
            timeout: 50000,
            success: function(res){

                if(res){
                    var error = '';

                    if(res.code){
                        switch(res.code){
                            case '0':
                                enableBtnTicket(ERROR.normal);
                                break;
                            case '5':
                                error = ERROR.sessionEnd;
                                break;
                            case '6':
                                error = ERROR.activityInactive;
                                break;
                            case '-1':
                                error = ERROR.activityEnd;
                                break;
                            default:
                                enableBtnTicket(ERROR.normal);
                                showTip(ERROR.timeout);
                                break;
                        }
                        if(error){
                            disableBtnTicket(error);
                        }
                    }

                    if(res.nextTime || res.nextTime2){
                        var text = res.nextTime || res.nextTime2;
                        $('#state').html('下一轮抢票开始时间<br>'+text);
                    }else if(error){
                        $('#state').text(error);
                    }

                }
                checkApp(type);

            },
            fail: function(res){
                console.error(res)
                showTip('error', res.status +' '+ res.statusText);
                disableBtnTicket(ERROR.timeout);
                checkApp(type);
            },
            error: function(res){
                console.error(res)
                showTip('error', res.status +' '+ res.statusText);
                disableBtnTicket(ERROR.timeout);
                checkApp(type);
            }
        })
    }

    function checkApp(type){
        if(type !== 'app'){
            $('#btn-movie').text('立即下载App').attr('href', WeUI.Config.appDownUrl).removeClass('btn-disable').addClass('btn-inactive');
        }
    }

    /**
     * 抢票接口
     */
    function getTicket(){
        return login(function(t){
            if(t){
                disableBtnTicket(ERROR.loading);

                $.ajax({
                    type: 'POST',
                    url: HOST.api + '/movieAct/reserved',
                    data: {
                        token: t
                    },
                    dataType: 'json',
                    timeout: 50000,
                    success: function(res){
                        if(res){
                            if(res.code){
                                var error = '';
                                switch(res.code){
                                    case '0':
                                        enableBtnTicket(ERROR.normal);
                                        if(res.msg){
                                            showModal(res.msg);
                                        }else{
                                            showModal(ERROR.success);
                                        }
                                        break;
                                    case '1': // 未登录
                                    case '4': // 第三方登录
                                        return login(function(t){
                                            enableBtnTicket(ERROR.normal);
                                        });
                                        break;
                                    case '3':
                                        enableBtnTicket(ERROR.normal);
                                        showModal(ERROR.invalid);
                                        break;
                                    case '5':
                                        error = ERROR.sessionEnd;
                                        break;
                                    case '6':
                                        error = ERROR.activityInactive;
                                        break;
                                    case '-1':
                                        error = ERROR.activityEnd;
                                        break;
                                    default:
                                        enableBtnTicket(ERROR.normal);
                                        showTip(ERROR.timeout);
                                        break;
                                }
                                if(error){
                                    disableBtnTicket(error);
                                }
                            }

                            if(res.nextTime || res.nextTime2){
                                var text = res.nextTime || res.nextTime2;
                                $('#state').html('下一轮抢票开始时间<br>'+text);
                            }else if(error){
                                $('#state').text(error);
                            }
                        }

                    },
                    fail: function(res){
                        console.error(res)
                        showTip('error', res.status +' '+ res.statusText)
                    },
                    error: function(res){
                        console.error(res)
                        showTip('error', res.status +' '+ res.statusText)
                    }
                })
            }
        })
    }

    function showTip(msg){
        $('.tip').text(msg).removeClass('hidden');

        setTimeout(function(){
            $('.tip').addClass('hidden');
        }, 1500)
    }

    function showModal(msg){
        if($('.modal').hasClass('hidden')){
            $('#modal').text(msg);

            $('.mask').removeClass('hidden');
            $('.modal').removeClass('hidden');
        }
    }

    function hideModal(){
        if(!$('.modal').hasClass('hidden')){
            $('.modal').addClass('hidden');
            $('.mask').addClass('hidden');
        }
    }

    function disableBtnTicket(error){
        // if(BTSDK.appVersion || Request.url('os')){
            if(!$('#btn-movie').hasClass('btn-disable')){
                $('#btn-movie').addClass('btn-disable')
            }
            $('#btn-movie').text(error);
        // }else{
        //     enableBtnTicket('立即下载App');
        //     $('#btn-movie').attr('href', DownUrl().url);
        // }
    }

    function enableBtnTicket(msg){
        if($('#btn-movie').hasClass('btn-disable')){
            $('#btn-movie').removeClass('btn-disable')
        }
        
        // if(BTSDK.appVersion || Request.url('os')){
            $('#btn-movie').text(msg?msg:ERROR.normal);
        // }else{
            // $('#btn-movie').text('立即下载App').attr('href', DownUrl().url);
        // }
    }

    $(document).on('tap', '.btn-rule', function(evt){
        $('.rule-body').toggleClass('hidden');
    })

    $(document).on('tap', '.modal .close', function(evt){
        return hideModal();
    })

    $(document).on('tap', '#btn-movie', function(evt){
        if(!$(this).hasClass('btn-disable') && !$(this).hasClass('btn-inactive')){
            return getTicket();
        }
    })

})
