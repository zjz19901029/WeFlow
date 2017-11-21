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
        wx_share: 'http://10.237.151.123:8084/socialmember-webservice-maserati/',
        wx_oauth: 'wxe196afa36a2a4cf0&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/actoauth?redirectUrl=' ), // o2om测试服微信授权API
        wx_login: 'wxe196afa36a2a4cf0&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/login?redirectUrl=' ), // o2om测试服微信绑定公众号API
        goodsApi: 'http://10.100.112.198:8999',
        goodsDetail: 'http://10.100.112.198/goods.html#/goodsDetail?productId=',
        goodsIndex: 'http://10.100.112.198/goods.html#/goodsIndex',
        hotelDetail: 'http://10.237.157.20:8099/wehotelapp/hotel/index.html#/detail?innId=',
        hotelList: 'http://10.237.157.20:8099/wehotelapp/hotel/index.html#/list?'
    },

    test: {
        wx_share: 'http://10.237.151.123:8084/socialmember-webservice-maserati/',
        wx_oauth: 'wxe196afa36a2a4cf0&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/actoauth?redirectUrl=' ), // o2om测试服微信授权API
        wx_login: 'wxe196afa36a2a4cf0&redirect_uri=' + encodeURIComponent( 'http://ctiptest.platenogroup.com/oauth2/authorize/login?redirectUrl=' ), // o2om测试服微信绑定公众号API
        goodsApi: 'http://10.100.112.198:8999',
        goodsDetail: 'http://10.100.112.198/goods.html#/goodsDetail?productId=',
        goodsIndex: 'http://10.100.112.198/goods.html#/goodsIndex',
        hotelDetail: 'http://10.237.157.20:8099/wehotelapp/hotel/index.html#/detail?innId=',
        hotelList: 'http://10.237.157.20:8099/wehotelapp/hotel/index.html#/list?'
    },

    prod: {
        wx_share: 'http://m.7daysinn.cn/maserati/',
        wx_oauth: 'wx56daa115de20b2e1&redirect_uri=' + encodeURIComponent( 'http://m.7daysinn.cn/oauth2/authorize/actoauth?redirectUrl=' ), // 铂涛会公众号微信授权API
        wx_login: 'wx56daa115de20b2e1&redirect_uri=' + encodeURIComponent( 'http://m.7daysinn.cn/oauth2/authorize/login?redirectUrl=' ), // 铂涛会公众号微信绑定公众号API
        goodsApi: 'http://activity.plateno.com',
        goodsDetail: 'https://mall.plateno.com/#/goodsDetail?productId=',
        goodsIndex: 'https://mall.plateno.com/#/goodsIndex',
        hotelDetail: 'http://trip.plateno.com/wehotelapp/hotel/index.html#/detail?innId=',
        hotelList: 'http://trip.plateno.com/wehotelapp/hotel/index.html#/list?'
    }
};
config.test.img = config.img.dev + config.name;
config.test.shareimg = config.img.shareimg + config.name;
config.dev.img = config.dev.shareimg = config.img.dev + config.name;
config.prod.img = config.prod.shareimg = config.img.prod + config.name;
module.exports = config;