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
    dev: {
        wx_share: 'http://ctiptest.platenogroup.com/socialmember-webservice-maserati/',
        wx_oauth: 'wx65cc7f25977b4ccb&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/actoauth?redirectUrl=' ), // o2om测试服微信授权API
        wx_login: 'wx65cc7f25977b4ccb&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/login?redirectUrl=' ) // o2om测试服微信绑定公众号API
    },

    test: {
        wx_share: 'http://ctiptest.platenogroup.com/socialmember-webservice-maserati/',
        wx_oauth: 'wx65cc7f25977b4ccb&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/actoauth?redirectUrl=' ), // o2om测试服微信授权API
        wx_login: 'wx65cc7f25977b4ccb&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/login?redirectUrl=' ) // o2om测试服微信绑定公众号API
    },

    prod: {
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