const schedule = require('node-schedule');
const getSql = require("../models/db");
const Util = require("../lib/utils");
const log4js = require('../lib/log');
const logger = log4js.logger("oAuth");
class scheduleList{
    //用户进入一个任务倒计时1小时
    userTaskTimeOut(t){
        let date = new Date(t.nexttime);
        let j = schedule.scheduleJob(date,async function(){
            t.nowTime = Util.getNewTime(new Date());
            let cbData = await getSql.getUserTaskTimeOut(t);
            if(cbData.status == 200) {
                logger.warn('任务时间到期: ', t.id + "的任务时间到期，时间为:" + t.nexttime);
            }
        });
    }


}
module.exports = new scheduleList();
