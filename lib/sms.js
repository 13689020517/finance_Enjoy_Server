const QcloudSms = require("qcloudsms_js");
const config = require("../config");
var qcloudsms = QcloudSms(config.msgAppId, config.msgAppKey);
const ssender = qcloudsms.SmsSingleSender();
class smsSing {
    constructor(){
    }
    /**
     * 发送一条短信，验证手机号码
     * **/
    sendSmsOne(obj){
        return new Promise(function(resolve, reject){
            let params = [obj.randomNum,5];
            ssender.sendWithParam(86,obj.phone,config.msgTemplateId,params,config.smsSign,"","",function(err, res, resData){
                if (err) {
                    console.log("err: ", err);
                    resolve(err);
                } else {
                    console.log("request data: ", res.req);
                    console.log("response data: ", resData);
                    resolve(resData);
                }
            });
        });
    }
}
module.exports = new smsSing();