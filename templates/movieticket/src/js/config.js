var config = {
    name: '<%= project %>',

    /**
     * 图片路径
     */
    img: {
        dev: '../img/',
        shareimg: 'http://ctiptest.platenogroup.com/marketing-activities/img/',
        prod: 'http://imgs.plateno.com:8080/static/img/'
    },
    list:'http://trip.plateno.com/apph5/views/search.html#!/domesticRecommend',
    /**
     * host for api
     * 酒店相关URL
     * 
     * dev      开发环境
     * test     测试环境 酒店和门票为预生产环境 需要测试微信授权时在这里测
     * prod     线上环境
     */
    dev: {
        api: 'http://10.100.112.123:8084/socialmember-webservice-act/ext',
        wx_share: 'http://ctiptest.platenogroup.com/socialmember-webservice-maserati/',
        wx_oauth: 'wx65cc7f25977b4ccb&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/actoauth?redirectUrl=' ), // o2om测试服微信授权API
        wx_login: 'wx65cc7f25977b4ccb&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/login?redirectUrl=' ) // o2om测试服微信绑定公众号API
    },

    test: { // ctiptest
        api: 'http://10.100.112.54:8083/socialmember-webservice-act/ext',
        wx_share: 'http://ctiptest.platenogroup.com/socialmember-webservice-maserati/',
        wx_oauth: 'wx65cc7f25977b4ccb&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/actoauth?redirectUrl=' ), // o2om测试服微信授权API
        wx_login: 'wx65cc7f25977b4ccb&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/login?redirectUrl=' ) // o2om测试服微信绑定公众号API
    },

    prod: {
        api: 'http://m.7daysinn.cn/socialmember-webservice-act/ext',
        wx_share: 'http://m.7daysinn.cn/maserati/',
        wx_oauth: 'wx56daa115de20b2e1&redirect_uri=' + encodeURIComponent( 'http://m.7daysinn.cn/oauth2/authorize/actoauth?redirectUrl=' ), // 铂涛会公众号微信授权API
        wx_login: 'wx56daa115de20b2e1&redirect_uri=' + encodeURIComponent( 'http://m.7daysinn.cn/oauth2/authorize/login?redirectUrl=' ) // 铂涛会公众号微信绑定公众号API
    }
};

config.test.img = config.img.dev + config.name;
config.test.shareimg = config.img.shareimg + config.name;
config.dev.img = config.dev.shareimg = config.img.dev + config.name;
config.prod.img = config.prod.shareimg = config.img.prod + config.name;
module.exports = config;
