const createError = require('http-errors');
const ErrorCode = require('../lib/ErrorCode');
const getSql = require("../models/activation_db");
const utils = require("../lib/utils");
// const redis = require("../lib/redis");
const log4js = require('../lib/log');
const request = require("request");
const config = require("../config");
const getRedis = require("../lib/getRedis");
const sendSms = require("../lib/sms");
const logger = log4js.logger("oAuth");
class oAuth {
    constructor() {
    };
    /**
    * 查询我的推广码领取周期
    * **/
    async querydenominationTime(req, res, next) {
        //【1】获得user
        //【2】根据userid查询
        //【3】{time:point:status|time:point:status|time:point:status|time:point:status}
        //【4】返回给客户端
        try {
            let userId = await getRedis.getUserSession(req.headers.token);//req.headers.token:获取请求头中的token   根据请求头中的token获取用户id
            let ids = userId == null ? null : JSON.parse(userId).id;//如果用户id为null,那么id就为null,否则就将userId转为对象格式,再取出id;
            req.body.user_id = ids;//将获取到ids赋值给req.body中的user_id
            let queryTime = await getSql.queryActivationUser(req.body);//根据请求体中的id查询请求码
			let userdata = {};
	    if(queryTime.data && queryTime.data.length){
	       let userdatad = JSON.parse(queryTime.data[0].data);
	       let end = Number(queryTime.data[0].numberpaic)+1;
	       userdata.list = userdatad.slice(0, end);
		   userdata.integral=queryTime.data[0].integral;   
	    }
            return res.json(utils.fureturn(queryTime.status, queryTime.message, userdata));
        } catch (error) {
            next(error)
        }
    }
    /**
     * 激活推广码
     * 
         //【1】判断该用户是否已经激活
         //【2】激活码是否有效
         //【3】修改redeem_activation_code
         //【4】插入数据redeem_activation_user_details
         //【5】返回给客户端
     * **/
    /*当前:目前获取的积分情况,只有第一个可以激活以及领取;
    * 需求:积分卡可以全部激活,但是仍然要按照时间顺序依次领取,并且,要按照积分卡的时间限制才能领取;
    * */
    async getExchangeCode(req, res, next) {
        try {
            let pager = {};
            let qudata = {};//查询激活码
            let qpdata = {};//查询用户积分
            let zqDataTime = [];//下个周期面额领取日期
	        let integral=[];
            let userId = await getRedis.getUserSession(req.headers.token);
            let ids = userId == null ? null : JSON.parse(userId).id;
            req.body.user_id = ids;
            if (utils.isNull(req.body.regional_code) != true) {
                //"SELECT regional_code,code_rules_id,flag FROM redeem_activation_code where regional_code = '" + obj.regional_code + "'"
                qudata = await getSql.queryCodeAre(req.body);//判断查询激活码是否存在
                let quID = await getSql.queryCodeID(req.body);//根据用户id查询推广码是否绑定过
                if (utils.isNull(qudata.data[0]) != true)//说明存在推广码 -但是，是第一次激活
                {
                    console.log(quID);
                    if (utils.isNull(quID.data[0])) {//null、undefined、空字符串 返回true  因此 如果是空,那就没绑定过
                        //加个判断
                        req.body.time = utils.getNowTime();//获取当前时间
                        //qudata中是在redeem_activation_code表格中查询的数据,里面没有denomination字段;
                        //denomination字段是在redeem_activation_rules表格中;
                        req.body.denomination = qudata.data[0].denomination;//????????????
                        req.body.code_rules_id = qudata.data[0].code_rules_id;//2
                        req.body.flag = qudata.data[0].flag;
                        if (req.body.flag === 0) {
                            // "select denomination,denomination_cycle from redeem_activation_rules where id = "+ obj.code_rules_id;
                            let denomination_details = await getSql.querydenomination_cycle(req.body);//查询redeem_activation_rules - denomination_cycle面额周期
                            if (utils.isNull(denomination_details.data[0]) === false) {
                                let JSdenomination_cycle = JSON.parse(denomination_details.data[0].denomination_cycle);
                                let keycycle = utils.getJsonLength(JSdenomination_cycle);//周期长度
                                let nowTime = req.body.time;//周期领取时间
                                for (let i = 1; i <= keycycle; i++) {
                                    if (i == 1) {
                                        zqDataTime[i - 1] = { "time": nowTime, "point": JSdenomination_cycle[i].split('|')[1], "status": 0 };
                                    } else {
                                        nowTime = utils.dateAddDays(nowTime, JSdenomination_cycle[i].split('|')[0]);//下次积分领取时间
                                        zqDataTime[i - 1] = { "time": nowTime, "point": JSdenomination_cycle[i].split('|')[1], "status": 0 };
                                    }
                                }
                                //"select point from user where user_id ="+ obj.user_id
                                qpdata = await getSql.queryUserPoint(req.body); //查询用户积分
                                req.body.pointtime = JSON.stringify(zqDataTime);//将后面要领取的时间的数组转为字符串 再放入req的body中
                                //req.body.keycycle = keycycle;//领取的周期
                                //req.body.keycycle_integral = JSdenomination_cycle[keycycle].slice(2);//周期领取的积分
                                integral = JSON.parse(denomination_details.data[0].denomination);
				                req.body.integral = JSON.stringify(integral);
                                req.body.userPoint = qpdata.data[0].point;//User用户积分数
                                let insertsuccess = await getSql.insertredeem(req.body);//插入兑换推广积分表---- 改变推广码激活状态&激活时间 --- 修改推广码详情激活状态 --- 插入用户兑换积分详情表
                                pager = utils.fureturn(insertsuccess.status, '成功激活推广码:' + qudata.data[0].regional_code, req.body.pointtime);
                            } else {
                                pager = utils.fureturn(401, '未查询到该用户面额周期', 0);
                            }
                        } else {
                            pager = utils.fureturn(401, '该兑换码已激活', 0);
                        }
                    } else {
                        pager = utils.fureturn(401, '该用户已绑定过激活码', 0);
                    }
                } else {
                    pager = utils.fureturn(401, '该激活码不存在', 0);
                }
            } else {
                pager = utils.fureturn(401, '输入激活码不能为空', 0);
            }
            return res.json(pager);
        } catch (error) {
            next(error);
        }
    }
    /**
       * 兑换积分激活码
       * 客户端传参数idx 0 1 2 3
       * {time:point:status|time:point:status|time:point:status|time:point:status}
       */
    async getChangeCode(req, res, next) {
        //【1】 根据Userid查询redeem_activation_user_details，获得time:point:status|time:point:status|time:point:status|time:point:status
        //【2】 判断idx数组长度，防止数组越界
        //【3】 判断状态、时间
        //【4】 给用户user加积分、idx[time:point:status|time:point:status|time:point:status|time:point:status]中的status修改为1，update redeem_activation_user_details
        //【6】返回给客户端
        try {
            if (req.body.index < 0 && utils.isNull(req.body.index)) {
                return res.json(utils.fureturn(401, '下标值错误', 0));
            }
            let userId = await getRedis.getUserSession(req.headers.token);
            let ids = userId == null ? null : JSON.parse(userId).id;
            req.body.user_id = ids;
            //select data,userid,numberpaic,integral from redeem_activation_user where userid ="+obj.user_id
            //data:[{"time":"2018-12-03 15:53:48","point":"30","status":0},{"time":"2018-12-4 15:53:48","point":"30","status":0},
            // {"time":"2018-12-5 15:53:48","point":"|30","status":0},{"time":"2018-12-6 15:53:48","point":"|30","status":0},
            // {"time":"2018-12-7 15:53:48","point":"|30","status":0},{"time":"2018-12-8 15:53:48","point":"30","status":0},
            // {"time":"2018-12-9 15:53:48","point":"20","status":0}]
            let auser = await getSql.queryActivationUser(req.body);
	        let userdata = JSON.parse(auser.data[0].data);
            if (req.body.index >= userdata.length) {
                return res.json(utils.fureturn(401, '长度错误', 0));
            }
            if (userdata[req.body.index].status == 1) {
                return res.json(utils.fureturn(401, '非法兑换', 0));
            }
            let curtime = utils.getNowTime();
            let indextime = userdata[req.body.index].time;
            if (utils.getTimeStamp(curtime) < utils.getTimeStamp(indextime)) {
                return res.json(utils.fureturn(401, '未到时间,非法兑换', 0));
            }
            userdata[req.body.index].status = 1;
            //判断用户已领取次数
            //step 1
            let obj = {};
            obj.data = JSON.stringify(userdata);
            obj.userid = req.body.user_id;
            obj.point = userdata[req.body.index].point.replace('|', '');
            obj.time = curtime;
			obj.numberpaic=1;
            let success = await getSql.insertActivationExchange(obj);//插入exchange详情 - 更新code表用户绑定 - 更新用户积分
            return res.json(utils.fureturn(success.status, '兑换成功', userdata[req.body.index]));
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new oAuth();
