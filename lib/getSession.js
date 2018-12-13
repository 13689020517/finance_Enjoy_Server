const getRedis = require('./getRedis');
class getSession{
    async getUserSession(t){
        let userToken = await getRedis.getUserSession(t);
        let users;
        if(userToken == null || userToken == "null"){
            users = null;
        }else{
            users = JSON.parse(userToken);
        }
        return users;
    }
    /*获取用户是否已经再任务中*/
    async getUserTask(t){
        let userTask = await getRedis.getUserTask(t);
        let users;
        if(userTask == null || userTask == "null"){
            users = null;
        }else{
            users = JSON.parse(userTask);
        }
        return users;
    }
    /*获取这个任务这个小时已经做了几个*/
    async getTaskCount(t){
        let taskCount = await getRedis.getTaskCount(t);
        let users;
        if(taskCount == null || taskCount == "null"){
            users = null;
        }else{
            users = JSON.parse(taskCount);
        }
        return users;
    }
    /*获取兑换条数*/
    async getExchangeItemList(name){
        let exchange = await getRedis.getExchangeItemList(name);
        let users;
        if(exchange == null || exchange == "null"){
            users = null;
        }else{
            users = exchange;
        }
        return users;
    }

}

module.exports = new getSession();