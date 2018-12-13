const config = {
    /**
     *    程序运行的端口
     */
    port : "8080",
    /**
     * 限制用户唯一登录
     */
    only_sign: true,
    enjoyPath : 'http://server.enjoybuy88.com',
    // enjoyPath : 'http://192.168.1.15:8080',
    enjoyWxPath : 'http://server.enjoybuy88.com/',
    /**
     * 图片存储路径
     * **/
    // imgPath : './enjoy/public/upload/img/',
    imgPath : './img/',
    /**
        *mysql 数据库配置/
     */
    // mysql_host: '192.168.0.109',
    mysql_db: 'enjoy',
    mysql_userid: 'root',
    mysql_password: '123u123u',
    // mysql_host: '127.0.0.1',
    mysql_host: '192.168.1.12',
    // mysql_db: 'enjoy',
    // mysql_userid: 'root',
    // mysql_password: '67u56u4',
    mysql_port : '3306',
    //日志
    logfile: './enjoy/logs/',
    /**
     * redis配置
     * */
    redis_host:"127.0.0.1",
    redis_port:6379,
    redis_session_db : 1,
    redis_session_password : '',
    /**
     * session前缀
     * **/
    session_RegisterSMSCode:'RegisterSMSCode',//短信前缀
    session_UserCode : 'FengGeShuaiDaiLe', //用户信息前缀
    session_userTaskCount : 'FENGGEUSERTASK',//该用户是否当前有任务
    session_taskCount : 'FENGGETASKCOUNT',//该任务该小时的数量
    session_wxtoken : "wxaccess",
    session_wxtokenTTL : 60*60*2,
    session_ttl_sendSMS: 60*5, //短信session失效时间,单位秒
    session_ttl_userSession : 60*60*24, //用户信息失效时间，24小时
    session_ttl_userTaskSession : 60*60,
    session_ttl_sendSessionTTL : 5,
    /**短信平台 */
    // msg_uid:'2928',
    // msg_pwd:'qhbn7778',
    // msg_pwd_md5:'488a61a28d6805b66c4fd55481b9b585'
    msgAppId : "1400151113",
    msgAppKey : "77c621ce62aa02530f9190e3615470c2",
    msgTemplateId : "208883",
    smsSign : "e购享",
    /**
     * 微信登录
     * **/
    appid  : 'wx68cf84b9cfecf34c',
    appsecret : "8b6002f54d04ed0317f324d8ebfb818d",
    approute: "get_wx",

    /**
     *  cdn cos
     * **/
    secretId : 'AKIDXxSp26jgCXiiW8kqJckgQyMZeYGo6QRH',
    secretKey : 'n7JJ7j9QMCrNG5oMjv0ugEl9PTM3bx87',
    bucket : 'enjoy-1257790002',
    region : 'ap-guangzhou',
    cdnUrl : 'https://enjoy-1257790002.cos.ap-guangzhou.myqcloud.com/'
};
module.exports = config;