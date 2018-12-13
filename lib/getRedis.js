const redis = require("../lib/redis");
const config = require("../config");
const redisClient_sendSMSCode = redis.createClient({ db: 4 });
const redisClient_user = redis.createClient({db:5});
const redisClient_userTask = redis.createClient({db:9});
const redisClient_taskCount = redis.createClient({db:10});
const redisClient_itemlist = redis.createClient({db:11});
const redisClient_access = redis.createClient({db:12});
//请求数据方法
class getRedis{
    constructor(){

    }
    /**
     * 获取短信验证码
     * **/
    getMsgCode(obj){
        let p = new Promise(function (resolve, reject) {
            redisClient_sendSMSCode.get(config.session_RegisterSMSCode + obj, function (err1, obj) {
                if(err1){
                    resolve(null);
                }else{
                    resolve(obj);
                }
            });
        });
        return p;
    }

    /**
     * 存储短信验证码
     * **/
    setMsgCode(obj){
           redisClient_sendSMSCode.set(config.session_RegisterSMSCode + obj.phone, obj.randomNum, 'EX', config.session_ttl_sendSMS);
    }
    /**
     * 存用户名等信息
     * **/
    setUserSession(token,obj){
        redisClient_user.set(config.session_UserCode + token,JSON.stringify(obj),'EX',config.session_ttl_userSession);
    }
    setUserSessionTtl(token,obj){
        redisClient_user.set(config.session_UserCode + token,JSON.stringify(obj),'EX',config.session_ttl_sendSessionTTL);
    }
    /**
     * 获取用户信息
     * **/
    getUserSession(obj){
        let p = new Promise(function (resolve, reject) {
            //redisClient_user 存放user的5号redis数据库
            redisClient_user.get(config.session_UserCode + obj, function (err1, obj) {//session_UserCode : 'FengGeShuaiDaiLe', //用户信息前缀
                if(err1){
                    resolve(null);
                }else{
                    resolve(obj);
                }
            });
        });
        return p;
    }
    /**
     * 获取用户是否当前状态有任务
     * **/
    getUserTask(obj){
        let p = new Promise(function(resolve,reject){
            redisClient_userTask.get(config.session_userTaskCount + obj,function(err1,obj){
                if(err1){
                    resolve(null);
                }else{
                    resolve(obj);
                }
            });
        });
        return p;
    }
    /**
     * 存用户当前有一个任务
     * **/
    setUserTask(obj){
        redisClient_userTask.set(config.session_userTaskCount + obj.id,JSON.stringify(obj),'EX',config.session_ttl_userTaskSession);
    }

    /**
     * 存该小时量任务量
     * **/
    setTaskCount(obj){
        redisClient_taskCount.set(config.session_taskCount + obj.id,JSON.stringify(obj),'EX',obj.timeout);
    }

    /**
     * 获取这个任务这个小时的量
     * **/
    getTaskCount(obj){
        let p = new Promise(function(resolve,reject){
            redisClient_taskCount.get(config.session_taskCount + obj,function(err1,obj){
                if(err1){
                    resolve(null);
                }else{
                    resolve(obj);
                }
            });
        });
        return p;
    }

    /**
     * 存兑换列表,
     * **/
    setExchangeItem(name,obj){
        redisClient_itemlist.lpush(name, JSON.stringify(obj));
    }
    /**
     * 如果超过50条就清最后一条
     * **/
    getExchangeItemCount(name) {
        redisClient_itemlist.llen(name, function (err, obj) {
            if (obj >= 10) {
                redisClient_itemlist.rpop(name);
            }
        });
    }
    /**
     * 获取最新数据
     * **/
   async getExchangeItem(name){
        let p = new Promise(function(resolve,reject){
            redisClient_itemlist.lindex(name, 0,function (err, obj) {
                if(err){
                    reject(err)
                }
                resolve(obj);
            })
        });
        return p;
    }

    /**
     * 获取最前面50条数据
     **/
    getExchangeItemList(name){
       let p = new Promise(function(resolve,reject){
           redisClient_itemlist.lrange(name,0,9,function(err,obj){
               if(err){
                   reject(err)
               }
               resolve(obj);
           })
       });
       return p;
    }
}


module.exports = new getRedis();
