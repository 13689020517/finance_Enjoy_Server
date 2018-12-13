const createError = require('http-errors');
const ErrorCode = require('../lib/ErrorCode');
const getSql = require("../models/db");
const Util = require("../lib/utils");
// const redis = require("../lib/redis");
const log4js = require('../lib/log');
const request = require("request");
const config = require("../config");
const sha1 = require('sha1');
const getSession = require("../lib/getSession");
const getRedis = require("../lib/getRedis");
const sendSms = require("../lib/sms");
const wxLogin = require("../lib/weChat");
const Base64 = require("../lib/base64");
const logger = log4js.logger("oAuth");
const schedule = require("../lib/schedule");
Array.prototype.in_array=function(e){
    var r=new RegExp(','+e+',');
    return (r.test(','+this.join(this.S)+','));
};
class oAuth {
    constructor() {
    };
    /**
     *  测试页面
     * */
    async index(req,res,next){
        return res.render("index");
    }
    /**
     *  postAuth权限控制,必带token
     *  第一次进来时，获取token，
     * */
    async Auth(req,res,next) {
        if(req.path == "/auth/login"){//登录页操作 直接放行
            next()
        }else{
            let userToken = await getSession.getUserSession(req.headers.token);
            let userT = userToken == null ? null : userToken.token;
            if (req.headers.token == userT && req.headers.token != null) {
                let cbData = await getSql.getUserStatus(userToken.id);
                console.log(cbData);
                if(cbData.data.length) {
                    if (cbData.data[0].status == 2) {
                        let err = {
                            message: "您的账号已被拉入黑名单，如有疑问，请联系客服",
                            code: ErrorCode.TokenLoss
                        };
                        res.json(err);
                    } else {
                        next();
                    }
                }else{
                    let err = {
                        message: "没有这个账号",
                        code: ErrorCode.TokenLoss
                    };
                    res.json(err);
                }
            }else{
                let err = {
                    message: "您的账号已被登录，请重新登录",
                    code: ErrorCode.TokenLoss
                };
                res.json(err);
            }
        }
    }
    /**
     * 获取登陆
     * */
    async login(req,res,next) {
            // let return_uri = encodeURIComponent(config.enjoyWxPath + config.approute);
            // let scope = 'snsapi_userinfo';
            // if(req.body.token){
            //     let getUser = await getRedis.getUserSession(req.body.token);
            //     if(getUser == null){
            //         return res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appid + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect')
            //     }else{
            //         let pager = {
            //             status : 200,
            //             message : "登录成功",
            //             data : getUser
            //         }
            //         return res.json(pager);
            //     }
            // }else {
            //     return res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appid + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect')
            // }
        // };

        //     let pager = {};
        //     pager.code = 200;
        //     if(req.body.id == "" || req.body.id == null){
        //         req.body.id = 2;
        //     }
        //     pager.data = {
        //         user_name : "微信号",
        //         icon : "sadalaksljda",
        //         sex : 1,
        //         token : Util.randomString(32),
        //         status : 1,
        //         id : 13,
        //         appId : Util.randomNum(4)
        //     };
        //     let obj = {
        //         name : pager.data.user_name,
        //         token : pager.data.token,
        //         id : req.body.id
        //     };
        //     let userId = await getSession.getUserSession(obj.id);
        //     //唯一性
        //     if(userId != null && userId != "null"){
        //         await getRedis.setUserSessionTtl(userId.token, null);
        //     }
        //     getRedis.setUserSession(obj.id,obj);
        //     getRedis.setUserSession(obj.token,obj);
        //     return res.json(pager);
        // };

        let code = req.body.code;
        let pager = {};
        let cbData = await getRedis.getUserSession(code);
        if (cbData == null) {
            let oneData = await wxLogin.requests('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.appid + '&secret=' + config.appsecret + '&code=' + code + '&grant_type=authorization_code');
            let access_token = oneData.data.access_token;
            let openid = oneData.data.openid;
            let twoData = await wxLogin.requests('https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN');
            if (twoData.status == 200) {
                let cbData = await getSql.getUserOpenId(openid);
                if (cbData.data.length) {
                    pager.data = {
                        user_name: cbData.data[0].user_name,
                        icon: cbData.data[0].img,
                        sex: cbData.data[0].sex,
                        token: access_token,
                        status: cbData.data[0].status,
                        id: cbData.data[0].user_id,
                        agency: cbData.data[0].agency
                    };
                } else {
                    twoData.data.uptime = Util.getNewTime(new Date());
                    twoData.data.nickname = encodeURIComponent(twoData.data.nickname);
                    let addUser = await getSql.postAddUser(twoData.data);
                    pager.data = {
                        user_name: twoData.data.nickname,
                        icon: twoData.data.headimgurl,
                        sex: twoData.data.sex,
                        token: access_token,
                        status: addUser.status,
                        id: addUser.data.insertId,
                        agency: 0
                    };
                }
                let obj = {
                    token: oneData.data.access_token,
                    openid: oneData.data.openid,
                    name: pager.data.user_name,
                    id: pager.data.id,
                    sex: pager.data.sex,
                    agency: pager.data.agency,
                    icon: pager.data.icon,
                    code: code
                };
                await getRedis.setUserSession(obj.id, obj);
                await getRedis.setUserSession(obj.token, obj);
                await getRedis.setUserSession(obj.code, obj);
                pager.code = cbData.status;
                pager.message = cbData.message;
                let timeObj = {
                    id : obj.id,
                    uptime : Util.getNewTime(new Date())
                };
                await getSql.postUserLastLoginTime(timeObj);
                return res.json(pager);
            } else {
                pager = {
                    code: twoData.status,
                    data: twoData.data,
                    message: twoData.message
                };
                return res.json(pager);
            }
        } else {
            pager = {
                code: 200,
                data: cbData,
                message: "成功"
            };
            return res.json(pager);
        }
    }
    /**
     * 获取微信签名
     * **/
    async pSignature(req,res,next){
        let oneData = await wxLogin.requests('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + config.appid + '&secret=' + config.appsecret);
        let access_token = oneData.data.access_token;
        let twoData = await wxLogin.requests('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi');
        let timestamp = parseInt(new Date().getTime() / 1000);
        let pager = {
            code : 200,
            message : "获取成功"
        };
        pager.ticket = twoData.data.ticket;
        pager.noncestr = sha1(new Date());
        pager.timestamp = timestamp;
        let string = 'jsapi_ticket=' + pager.ticket + '&noncestr=' + pager.noncestr + '&timestamp=' + timestamp + '&url=http://www.enjoybuy88.com';
        pager.signature = sha1(string);
        res.json(pager);
    }


    async username(req,res,next){
        let name = encodeURIComponent(req.body.username);
        // let name = req.body.username;
        let cb = await getSql.changeUserName(name);
        return res.json(cb);
    }
    async getusername(req,res,next){
        let cb = await getSql.getchangeUserName();
        let name = decodeURIComponent(cb.data[0].user_name);
        // let name = cb.data[0].user_name;
        return res.json(name);
    }
    /**
     * 注册用户信息
     * */
    async register(req,res,next){
        try {
            let { code,phone,userName } = req.body;
            let cbErr = {
                 code :   ErrorCode.ParamError
            };
            if (Util.isNull(code) || Util.isNull(userName) || Util.isNull(phone)) {
                cbErr.message = "请完善用户信息再提交";
                return res.json(cbErr);
            }
            let isExist = await new oAuth().userPhone(phone);
            if(!isExist) {
                cbErr.message = "手机号已存在";
                return res.json(cbErr);
            }
            let pager = {};
            let msgid = await getRedis.getMsgCode(req.body.phone);
            if(req.body.code ==  msgid) {
                let userId = await getSession.getUserSession(req.headers.token);
                let ids = userId == null ? null : userId.id;
                req.body.id = ids;
                req.body.userName = encodeURIComponent(req.body.userName);
                let cbData = await getSql.inRegister(req.body);
                pager.code = cbData.status;
                pager.message = cbData.message;
                return res.json(pager);
            }else{
                pager.code = ErrorCode.codeError;
                pager.message = "短信验证码错误";
                return res.json(pager);
            }
        }catch(e){
            next(e)
        }
    }

    /***
     * 判断手机号是否存在
     * **/
    async userPhone(phone){
        try {
            let user = await getSql.getUserPhone(phone);
            if (user != null)
                return true;
            else
                return false;
        } catch (e) {
            console.log(e);
        }
    }
    /**
     * 发送验证码
     * **/
    async sendMsg(req,res,next){
        try {
            let pager = {};
            let phone = req.body.phone;
            if (phone) {
                let isExist = await new oAuth().userPhone(phone);
                if (isExist) {
                    pager.randomNum = Util.randomNum(4);
                    let obj = {
                        randomNum: pager.randomNum,
                        phone: phone
                    };
                    let smsOk = await sendSms.sendSmsOne(obj);
                    if (smsOk.result == 0) {
                        getRedis.setMsgCode(obj);
                        res.json({message: "发送成功", code: 200});
                    } else {
                        res.json({message: "发送失败," + smsOk.errmsg, code: ErrorCode.ParamError});
                    }
                } else {
                    pager.code = ErrorCode.Success;
                    pager.message = "手机号已存在";
                    return pager;
                }
            } else {
                pager.code = ErrorCode.ParamError;
                pager.message = "短信验证码错误";
                return pager;
            }
        }catch(e){
            next(e)
        }
    }
    /**
     * 查询用户信息
     * */

    async getUserInfo(req,res,next){
        try {
            let pager = {};
            let userId = await getSession.getUserSession(req.headers.token);
            let ids = userId == null ? null : userId.id;
            let cbData = await getSql.getUserInfo(ids);
            pager.code = cbData.status;
            pager.data = cbData.data;
            if(cbData.data.length){
                cbData.data[0].user_name = decodeURIComponent(cbData.data[0].user_name);
            }
            return res.json(pager);
        }catch(e){
            next(e)
        }
    }

    /**
     *  查询我的任务
     * */
    async searchMyTask(req,res,next){
        try{
            let pager = {};
            let userId = await getSession.getUserSession(req.headers.token);
            req.body.ids = userId == null ? null : userId.id;
            let pageIndex = req.body.pageIndex,pageSize = req.body.pageSize;
            req.body.pageIndex = pageIndex == null || isNaN(pageIndex) ? 1 : req.body.pageIndex;
            req.body.pageSize = pageSize == null || isNaN(pageSize) ? 10 : pageSize;
            let cbData = await getSql.getSearchMyTask(req.body);
            let cbCount = await getSql.getMyTaskCount(req.body);
            pager.total = cbCount.data.length  ? cbCount.data[0].count : 0;
            pager.code = cbData.status;
            pager.data = cbData.data;
            return res.json(pager);
        }catch(e){
            next(e)
        }
    }


    /**
     * 查询我的积分
     * **/
    async searchMyIntegral(req,res,next){
        try{
            let pager = {};
            let userId = await getSession.getUserSession(req.headers.token);
            req.body.ids = userId == null ? null : userId.id;
            let pageIndex = req.body.pageIndex,pageSize = req.body.pageSize;
            req.body.pageIndex = pageIndex == null || isNaN(pageIndex) ? 1 : req.body.pageIndex;
            req.body.pageSize = pageSize == null || isNaN(pageSize) ? 10 : pageSize;
            let cbData = await getSql.getSearchMyIntegral(req.body);
            let cbCount = await getSql.getMyIntegralCount(req.body);
            pager.total = cbCount.data.length  ? cbCount.data[0].count : 0;
            pager.code = cbData.status;
            pager.data = cbData.data;
            return res.json(pager);
        }catch(e){
            next(e)
        }
    }


    /**
     * 查询我的礼品
     * **/
    async searchMyGift(req,res,next){
        try{
            let pager = {};
            let userId = await getSession.getUserSession(req.headers.token);
            req.body.ids = userId == null ? null : userId.id;
            let pageIndex = req.body.pageIndex,pageSize = req.body.pageSize;
            req.body.pageIndex = pageIndex == null || isNaN(pageIndex) ? 1 : req.body.pageIndex;
            req.body.pageSize = pageSize == null || isNaN(pageSize) ? 10 : pageSize;
            let cbData = await getSql.getSearchMyGift(req.body);
            let cbCount = await getSql.getMyGiftCount(req.body);
            pager.total = cbCount.data.length  ? cbCount.data[0].count : 0;
            pager.code = cbData.status;
            pager.data = cbData.data;
            return res.json(pager);
        }catch(e){
            next(e)
        }
    }

    /**
     * 获取任务详情
     * **/
    async getTaskDetails(req,res,next){
        try {
            let pager = {};
            if (Util.isNull(req.body.id) || !Util.isNumber(req.body.id)) {
                pager.code = ErrorCode.ParamError;
                pager.message = "参数错误";
                return res.json(pager);
            } else {
                let uptime = new Date();
                let obj = {
                    ids: req.body.id,
                    uptime: Util.getNewTime(uptime)
                };
                let cbData = await getSql.taskDetails(obj);
                if (cbData.data.length) {
                    pager.code = cbData.status;
                    pager.data = cbData.data;
                    pager.message = cbData.message;
                    let userSession = await getSession.getUserSession(req.headers.token);
                    let userId = userSession == null ? null : userSession.id;
                    //获取用户是否有任务在身
                    let getUserTask = await getSession.getUserTask(userId);
                    if (getUserTask == null) {
                        pager.data[0].isok = 1;
                    } else {
                        pager.data[0].isok = 0;
                    }
                    let onetime = cbData.data[0].starttime;
                    //获取该任务这个小时还剩多少个量
                    let getTaskCount = await getSession.getTaskCount(req.body.id);
                    //如果该任务这小时量为null,就赋值量
                    if (getTaskCount == null) {
                        if (onetime.getFullYear() == uptime.getFullYear() && onetime.getMonth() == uptime.getMonth() + 1 && onetime.getDate() == uptime.getDate() && onetime.getHours() == uptime.getHours()) {
                            pager.data[0].taskCount = cbData.data[0].onehours;
                        } else {
                            pager.data[0].taskCount = cbData.data[0].hours;
                        }
                        let nextHours = uptime.getFullYear() + "-" + (uptime.getMonth() + 1) + "-" + uptime.getDate() + " " + (uptime.getHours() + 1) + ":" + "00" + ":" + "00";
                        let timeout = (new Date(nextHours).getTime() - uptime.getTime()) / 1000;
                        let taskCountObj = {
                            id: req.body.id,
                            count: pager.data[0].taskCount,
                            timeout: parseInt(timeout)
                        };
                        getRedis.setTaskCount(taskCountObj);
                    } else {
                        pager.data[0].taskCount = getTaskCount.count;
                    }
                    return res.json(pager);
                }
                else {
                    pager.code = ErrorCode.NotFound;
                    pager.message = "找不到这个任务";
                    return res.json(pager);
                }
            }
        }catch(e){
            next(e);
        }
    }

    /**
     * 查询之前的任务
     * **/
    async lookTask(req,res,next){
        try{
            let pager = {};
            if (Util.isNull(req.body.id) || !Util.isNumber(req.body.id)) {
                pager.code = ErrorCode.ParamError;
                pager.message = "参数错误";
                return res.json(pager);
            } else {
                let userSession = await getSession.getUserSession(req.headers.token);
                let userId = userSession == null ? null : userSession.id;
                let obj = {
                    uid : userId,
                    id : req.body.id
                };
                let cbData = await getSql.postLookTask(obj);
                pager = {
                    code : cbData.status,
                    message : cbData.message,
                    data : cbData.data
                };
                pager.data = cbData.data.length ? cbData.data[0] : null;
                if(cbData.data.length) {
                    pager.data.endtime = cbData.data.length ? cbData.data[0].user_end_time : null;
                }
                return res.json(pager);
            }
        }catch(e){
            next(e);
        }
    }
    /**
     * 做任务
     * ***/
    async getDoTask(req,res,next){
        try{
            let pager = {};
            if (Util.isNull(req.body.id) || !Util.isNumber(req.body.id)) {
                pager.code = ErrorCode.ParamError;
                pager.message = "参数错误";
                return res.json(pager);
            } else {
                let getTaskCount = await getSession.getTaskCount(req.body.id);
                //如果该任务这小时量为null
                if (getTaskCount == null || getTaskCount.count == 0) {
                    pager.code = ErrorCode.ParamError;
                    pager.message = "该任务这个小时已经没有多余的任务数量了，请更换任务！";
                    return res.json(pager);
                } else {
                    //获取用户是否有任务在身
                    let userSession = await getSession.getUserSession(req.headers.token);
                    let userId = userSession == null ? null : userSession.id;
                    let getUserTask = await getSession.getUserTask(userId);
                    if (getUserTask == null) {
                        let uptime = new Date();
                        let obj = {
                            id: userId,
                            uptime: Util.getNewTime(uptime),
                            tid: req.body.id,
                            nexttime: new Date(uptime.getTime() + 1 * 60 * 60  * 1000),
                            endtime : Util.getNewTime(new Date(uptime.getTime() + 1 * 60 * 60 * 1000))
                        };
                        let isokObj = {
                            id : userId,
                            tid : req.body.id
                        }
                        //获取该任务是哪个平台的
                        let platformData = await getSql.postPlatFormData(isokObj);
                        let platform = platformData.data[0].platform;
                        //搜索该平台一个月能做任务的数量
                        let platCount = await getSql.postPlatCount();
                        //搜索用户一个月做的数量
                        let userCount = await getSql.postUserCount(isokObj);
                        let platformCount = 0,platUserCount = 0,ptName = "",userIspt = "";
                        switch(Number(platform)){
                            case 0 :
                                platformCount = platCount.data[0].taobao;
                                platUserCount = userCount.data[0].tbcount;
                                ptName = "淘宝";
                                userIspt = userCount.data[0].taobao;
                                break;
                            case 1 :
                                platformCount = platCount.data[0].jingdong;
                                platUserCount = userCount.data[0].jdcount;
                                ptName = "京东";
                                userIspt = userCount.data[0].jingdong;
                                break;
                            case 2:
                                platformCount = platCount.data[0].pinduoduo;
                                platUserCount = userCount.data[0].pddcount;
                                ptName = "拼多多";
                                userIspt = userCount.data[0].pingduoduo;
                                break;
                        }

                        if(userIspt == null){
                            pager.code = ErrorCode.ParamError;
                            pager.message = "您还没有填写" + ptName + "平台的账号";
                            return res.json(pager);
                        }else {
                            if (platUserCount < platformCount) {
                                //用户是否做过这个任务
                                let isOkdata = await getSql.postgetDoTaskIsOk(isokObj);
                                if (!isOkdata.data.length) {
                                    obj.platform = platform;
                                    //用户下任务操作
                                    let cbData = await getSql.postGetDoTask(obj);
                                    pager.code = cbData.status;
                                    pager.data = cbData.data;
                                    pager.message = cbData.message;
                                    if (cbData.status == 200) {
                                        //存redis
                                        //存用户已有任务清单
                                        await getRedis.setUserTask(obj);
                                        //定时任务，一小时后把任务过期
                                        await schedule.userTaskTimeOut(obj);
                                        let nextHours = uptime.getFullYear() + "-" + (uptime.getMonth() + 1) + "-" + uptime.getDate() + " " + (uptime.getHours() + 1) + ":" + "00" + ":" + "00";
                                        let timeout = (new Date(nextHours).getTime() - uptime.getTime()) / 1000;
                                        let taskCountObj = {
                                            id: req.body.id,
                                            count: Number(getTaskCount.count) - Number(1),
                                            timeout: parseInt(timeout)
                                        };
                                        //任务数量减少1
                                        await getRedis.setTaskCount(taskCountObj);
                                        //获取任务详情列表
                                        let objs = {
                                            ids: req.body.id,
                                            uptime: Util.getNewTime(uptime)
                                        };
                                        let cbTaskData = await getSql.taskDetails(objs);
                                        console.log(nextHours);
                                        if (cbTaskData.data.length) {
                                            pager.taskdata = cbTaskData.data[0];
                                        }
                                        pager.taskdata.endtime = new Date(obj.endtime);
                                        return res.json(pager);
                                    } else {
                                        return res.json(pager);
                                    }
                                } else {
                                    pager.code = ErrorCode.ParamError;
                                    pager.message = "您已经做过这个任务，请更换其它的任务";
                                    return res.json(pager);
                                }
                            } else {
                                pager.code = ErrorCode.ParamError;
                                pager.message = "您本月在" + ptName + "平台所作任务已满，请更换其他平台或等下月继续参与";
                                return res.json(pager);
                            }
                        }
                    } else {
                        pager.code = ErrorCode.ParamError;
                        pager.message = "您已经有任务在身，请先完成任务";
                        return res.json(pager);
                    }

                }
            }
        }catch(e){
            console.log(e);
            next(e);
        }
    }

    /**
     * 提交任务
     ***/
    async getSubTask(req,res,next){
        try {
            let {id,orderId, img} = req.body;
            console.log("进做任务这里");
            let pager = {};
            if (id == null || id == "" || orderId == null || img == null || orderId == "" || img == "") {
                pager.code = ErrorCode.ParamError;
                pager.message = "参数错误";
                return res.json(pager);
            } else {
                let userSession = await getSession.getUserSession(req.headers.token);
                let userId = userSession == null ? null : userSession.id;
                req.body.uid = userId;
                let isOkData = await getSql.postGetTaskStatus(req.body);
                console.log("提交任务id");
                console.log(id);
                console.log(isOkData);
                if(isOkData.data.length && isOkData.data[0].step != 0) {
                    pager = {
                        code: ErrorCode.ParamError,
                        message: "您已经提交过该任务,请勿重复提交",
                        data: []
                    };
                    return res.json(pager);
                }else{
                    req.body.uptime = Util.getNowTime();

                    let imgData = req.body.img;
                    //过滤data:URL
                    let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
                    let dataBuffer = new Buffer(base64Data, 'base64');
                    let base64 = await Base64(dataBuffer);
                    req.body.img = base64.data;
                    console.log(req.body.img);
                    let cbData = await getSql.postGetSubTask(req.body);


                    pager = {
                        code: cbData.status,
                        message: cbData.message,
                        data: cbData.data
                    };
                    return res.json(pager);
                }
            }
        }catch(e){
            next(e);
        }
    }

    /**
     * 兑换礼品
     * **/
    async getExChange(req,res,next){
        try{
            let pager = {};
            let userId = await getSession.getUserSession(req.headers.token);
            let ids = userId == null ? null : userId.id;
            let username = userId == null ? null : userId.name;
            //搜索三合一
            let getPointAll = await getSql.getPointAll(ids,req.body.id);
            //获取用户当前积分0
            //获取礼品积分1
            //获取供应商id2
            if(getPointAll[2].data[0].leftcount <= 0){
                pager.code = ErrorCode.ParamError;
                pager.data = [];
                pager.message = "礼品数量已经为空";
                return res.json(pager);
            }else {
                if (getPointAll[0].data[0].point < getPointAll[1].data[0].point) {
                    pager.code = ErrorCode.ParamError;
                    pager.data = [];
                    pager.message = "用户积分剩余数不足以兑换当前产品";
                    return res.json(pager);
                } else {
                    let supplierId = getPointAll[2].data[0].sup_id;
                    //获取供应商积分
                    let supplierPoint = await getSql.getSupplierPoint(supplierId);
                    if (supplierPoint.data.length) {
                        //礼品id，用户id，供应商id，创建时间，订单状态（0未派件1已经派件），更新时间，礼品积分，快递单号，用户积分类别(0完成评价任务1换取礼品2完成购买任务),用户积分，注释原因，供应商新的积分，供应商老积分，供应商积分类别（0，用户换取礼品1供应商提现）
                        //itemid, userid, supplierid, createtime, status, updatetime, itemPoint, expressnum,newUserPoint,type,userPoint,reason,newSupPoint,supplierPoint,supType
                        let intoObj = {
                            itemid: req.body.id,
                            userid: ids,
                            supplierid: supplierId,
                            createtime: Util.getNowTime(),
                            status: 0,
                            updatetime: Util.getNowTime(),
                            itemPoint: getPointAll[1].data[0].point,
                            userPoint: getPointAll[0].data[0].point,
                            // expressnum : ' ',
                            itemname: getPointAll[1].data[0].name,
                            type: 1,
                            supplierPoint: supplierPoint.data[0].point,
                            supType: 0,
                            // reason : ' '
                        };
                        intoObj.newUserPoint = parseInt(intoObj.userPoint) - parseInt(intoObj.itemPoint);
                        intoObj.newSupPoint = Number(intoObj.supplierPoint) + Number(intoObj.itemPoint);
                        //插入一条记录到积分兑换表point_exchange_item
                        //生成用户积分操作记录,
                        //减少用户积分
                        //增加供应商积分
                        //插入一条记录到供应商积分表
                        let pointHandle = await getSql.pointHandle(intoObj);
                        pager.code = pointHandle.status;
                        pager.data = pointHandle.data;
                        console.log(username);
                        console.log(decodeURIComponent(username));
                        if(pointHandle.status == 200) {
                            let redisList = {
                                data: decodeURIComponent(username) + "兑换了礼品" + intoObj.itemname,
                                time: Util.getNowTime()
                            }
                            await getRedis.setExchangeItem("itemlist", redisList);
                            await getRedis.getExchangeItemCount("itemlist");
                        }
                        return res.json(pager);
                    } else {
                        pager.code = ErrorCode.ParamError;
                        pager.data = [];
                        return res.json(pager);
                    }
                }
            }
        }catch(e){
            next(e)
        }
    }
    /**
     * 用户签到
     * **/
    async getSign(req,res,next){
        let pager = {};
        if(req.body.day == null || req.body.day == "" || isNaN(req.body.day)) {
            pager.code = ErrorCode.ParamError;
            pager.message = "参数错误";
            return res.json(pager);
        }else{
            let newDate = new Date();
            let nowDay = Util.getNowDay(newDate);
            let nowMonth = Util.getNowMonth(newDate);
            let nowYear = Util.getNowYear(newDate);
            if(req.body.day != nowDay || req.body.year != nowYear || req.body.month != nowMonth ){
                pager.code = ErrorCode.ParamError;
                pager.message = "今天是" + nowDay + "号哦，您的手机时间可能不准确，请调整为北京标准时间！";
                return res.json(pager);
            }else {
                let userToken = await getRedis.getUserSession(req.headers.token);
                let userid = userToken == null ? null : JSON.parse(userToken).id;
                let signNum = await getSql.getPostSign(userid);
                console.log(signNum);
                if (signNum.data.length && signNum.data[0].sign != null) {
                    let theday = JSON.parse(signNum.data[0].sign).day;
                    let isok = theday.in_array(req.body.day);
                    if (isok) {
                        pager.code = ErrorCode.ParamError;
                        pager.message = "您今天已经签到，请勿重复签到！";
                        return res.json(pager);
                    } else {
                        theday.push(req.body.day);
                        let signNum = {
                            day: theday
                        }
                        let cbData = await new oAuth().qdcz(userid, signNum);
                        pager.code = cbData.status;
                        pager.message = cbData.message;
                        return res.json(pager);
                    }
                } else {
                    let signNum = {
                        day: [req.body.day]
                    };
                    let cbData = await new oAuth().qdcz(userid, signNum);
                    pager.code = cbData.status;
                    pager.message = "签到成功";
                    return res.json(pager);
                }
            }
        }
    }
    /**
     * 签到操作
     * **/
    async qdcz(userid,sign){
        let obj = {
            ids : userid,
            sign : JSON.stringify(sign),
            uptime : Util.getNewTime(new Date())
        };
        let cbData = await getSql.getUserSign(obj);
        return cbData;
    }
    /**
     * 查询签到数量
     * **/
    async postSign(req,res,next){
        let userToken = await getRedis.getUserSession(req.headers.token);
        let userid = userToken == null ? null : JSON.parse(userToken).id;
        let cbData = await getSql.getPostSign(userid);
        let pager = {
            code : cbData.status,
            message : cbData.message,
            data : []
        };

        if(cbData.data.length && cbData.data[0].sign != null && cbData.data[0].sign != "") {
            pager.data = cbData.data.length ? JSON.parse(cbData.data[0].sign).day : [];
        }
        return res.json(pager);
    }

    /**
     * 获取评价任务
     * **/
    async pEvalTask(req,res,next){
        let userToken = await getRedis.getUserSession(req.headers.token);
        let userid = userToken == null ? null : JSON.parse(userToken).id;
        req.body.userid = userid;
        let cbData = await getSql.postEvalTask(req.body);
        let cbDataCount = await getSql.postEvalTaskUserCount(req.body);
        let pager = {
            code : cbData.status,
            data : cbData.data,
            message : cbData.message,
            total : 0
        };
        pager.total = cbDataCount.data.length ? cbDataCount.data[0].count : 0;
        return res.json(pager);
    }
    /**
     * 获取该用户是否有未做的评价任务
     * **/
    async pEvalTaskCount(req,res,next){
        let userToken = await getRedis.getUserSession(req.headers.token);
        let userid = userToken == null ? null : JSON.parse(userToken).id;
        let cbData = await getSql.postEvalTaskCount(userid);
        let pager = {
            code : cbData.status,
            data : [],
            message : cbData.message
        };
        pager.data = cbData.data.length ? cbData.data[0].count : 0;
        return res.json(pager);
    }
    /**
     * 接受评价任务
     * **/
    async pAcceptEvalTask(req,res,next){
        let pager = {};
        let userToken = await getRedis.getUserSession(req.headers.token);
        let userid = userToken == null ? null : JSON.parse(userToken).id;
        req.body.userid = userid;
        req.body.uptime = Util.getNewTime(new Date());
        let cbData = await getSql.postAcceptEvalTask(req.body);
        pager = {
            code : cbData.status,
            data : cbData.data,
            message : cbData.message
        };
        return res.json(pager);
    }
    /***
     * 提交评价任务
     * **/
    async pSubEvalTask(req,res,next){
        try {
            let pager = {};
            let userToken = await getRedis.getUserSession(req.headers.token);
            let userid = userToken == null ? null : JSON.parse(userToken).id;
            req.body.userid = userid;
            req.body.uptime = Util.getNewTime(new Date());
            let cbData = await getSql.postSubEvalTask(req.body);
            pager = {
                code: cbData.status,
                data: cbData.data,
                message: cbData.message
            };
            return res.json(pager);
        }catch(e){
            next(e)
        }
    }
    /**
     * 分享新用户进来
     * **/
    async pShare(req,res,next){
        try{
            let pager = {};
            let userToken = await getRedis.getUserSession(req.headers.token);
            let uId = userToken == null ? null : JSON.parse(userToken).id;
            let userName = userToken == null ? null : JSON.parse(userToken).name;
            if(uId == null){
                return res.json({
                    code : 400
                })
            }else {
                req.body.uId = uId;
                req.body.userName = userName.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
                req.body.uptime = Util.getNowTime(new Date());
                let cbData = await getSql.postShare(req.body);
                pager = {
                    code: cbData.status,
                    data: cbData.data,
                    message: cbData.message
                };
                return res.json(pager);
            }
        }catch(e){
            next(e);
        }
    }
    /**
     * 代理接口
     * **/
    async pAgency(req,res,next){
        try{
            let pager = {};
            let userToken = await getRedis.getUserSession(req.headers.token);
            let uId = userToken == null ? null : JSON.parse(userToken).id;
            if(uId == null){
                return res.json({
                    code : 400
                })
            }else {
                req.body.uId = uId;
                req.body.uptime = Util.getNowTime(new Date());
                let okData = await getSql.postIsOkAgency(req.body);
                if(okData.data[0].sublevel == null) {
                    let cbData = await getSql.postAgency(req.body);
                    pager = {
                        code: cbData.status,
                        data: cbData.data,
                        message: cbData.message
                    };
                    return res.json(pager);

                }else{
                    pager.code = 200;
                    pager.data = [];
                    pager.message = "该用户已有上级代理";
                    return res.json(pager);
                }
            }
        }catch(e){
            next(e);
        }
    }
}
module.exports =new oAuth();