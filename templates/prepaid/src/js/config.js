var config = {
    /**
     * webpack配置
     */
    name: '<%= project %>', // 项目名称 storevalueact16
    /**
     * 图片路径
     */
    img: {
        dev: '../img/',
        shareimg: 'http://ctiptest.platenogroup.com/marketing-activities/img/',
        prod: 'http://imgs.plateno.com:8080/static/img/'
    },

    /**
     * host for api
     * dev 开发环境
     * test 测试环境 酒店和门票为预生产环境
     * o2om 测试环境 酒店和门票为预生产环境 需要测试微信授权时在这里测
     * prod 线上环境
     */
    dev: {
        host: 'http://ctiptest.platenogroup.com/socialmember-webservice-maserati/ext/storedvalue',
        wx_share: 'http://ctiptest.platenogroup.com/socialmember-webservice-maserati/',
        wx_oauth: 'wxe196afa36a2a4cf0&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/actoauth?redirectUrl=' ), // o2om测试服微信授权API
        wx_login: 'wxe196afa36a2a4cf0&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/login?redirectUrl=' ) // o2om测试服微信绑定公众号API
    },

    test: {
        host: 'http://ctiptest.platenogroup.com/socialmember-webservice-maserati/ext/storedvalue',
        wx_share: 'http://ctiptest.platenogroup.com/socialmember-webservice-maserati/',
        wx_oauth: 'wxe196afa36a2a4cf0&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/actoauth?redirectUrl=' ), // o2om测试服微信授权API
        wx_login: 'wxe196afa36a2a4cf0&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/login?redirectUrl=' ) // o2om测试服微信绑定公众号API
    },

    prod: {
        host: 'http://m.7daysinn.cn/maserati/ext/storedvalue',
        wx_share: 'http://m.7daysinn.cn/maserati/',
        wx_oauth: 'wx56daa115de20b2e1&redirect_uri=' + encodeURIComponent( 'http://m.7daysinn.cn/oauth2/authorize/actoauth?redirectUrl=' ), // 铂涛会公众号微信授权API
        wx_login: 'wx56daa115de20b2e1&redirect_uri=' + encodeURIComponent( 'http://m.7daysinn.cn/oauth2/authorize/login?redirectUrl=' ) // 铂涛会公众号微信绑定公众号API
    },

    /**
     * route for redirect
     * app botaoota:// v1用hybrid_path v2用SDK
     * wx 微信 http://m.7daysinn.cn
     * m m站 http://m.plateno.com
     * pc http://www.plateno.com
     */
    app:{
        // v1 hybrid_path
        // v2 sdk
        
        login: 'botaoota://login',

        api: '/memberInfo',

        gift: 'botaoota://accountCharge?urlName=http://trip.plateno.com/static/members/rechargeProtocol.html&giftid='
    },

    wx: {
        api: '/wxmemberInfo',

        gift: 'http://m.7daysinn.cn/mc_front/views/memberCenter.html#!/chargeMoney?giftid='
    }
};
config.test.img = config.img.dev + config.name;
config.test.shareimg = config.img.shareimg + config.name;
config.dev.img = config.dev.shareimg = config.img.dev + config.name;
config.prod.img = config.prod.shareimg = config.img.prod + config.name;
module.exports = config;