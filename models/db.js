const getIndex = require("../lib/mysql").getIndex;
const getAffair = require("../lib/mysql").getAffair;
//数据请求
class getIndexSql{
    constructor(){
    }
    /**
     * 根据微信openid获取是否有用户
     * **/
    async getUserOpenId(ids){
        let sql = "SELECT * FROM user WHERE tencent_openid = '" + ids + "'";
        return await getIndex(sql);
    }

    async changeUserName(name){
        console.log(name);
        let sql = "UPDATE user SET user_name = ? where user_id = 2";
        let value = name;
        console.log(sql);
        return await getIndex(sql,value);
    }
    async getchangeUserName(){
        let sql = "SELECT user_name FROM user WHERE user_id = 2";
        return await getIndex(sql);
    }

    /**
     * 提交用户信息
     * */
    async inRegister(obj){
        try {
            let { id,userName,sex,role,age,address,phone,taobao,jingdong,pingduoduo } = obj;
            // let sql = "UPDATE user SET user_name = '"+userName+"', sex = "+sex+", role ="+role+", age = "+age+", address = '"+address+"', phone_number = "+phone+", taobao = '"+taobao+"', jingdong = '"+jingdong+"',pingduoduo='"+pingduoduo+"',status = 1 WHERE user_id = "+id;
            let sql = "UPDATE user SET user_name =?, sex = ?, role =?, age = ?, address = ?, phone_number = ?, taobao =?, jingdong =?,pingduoduo=?,status = 1 WHERE user_id = ?";
            let value = [userName,sex,role,age,address,phone,taobao,jingdong,pingduoduo,id];
            let list = await getIndex(sql,value);
            return list;
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * 搜索用户是否黑名单
     * **/
    async getUserStatus(ids){
        let sql = "SELECT status FROM user WHERE user_id = " + ids;
        return await getIndex(sql);
    }

    /**
     * 注册时查询用户手机号是否存在
     * **/
    async getUserPhone(phone){
        try {
            let sql = "SELECT * FROM user WHERE phone_number =" + phone;
            let list = await getIndex(sql);
            return list;
        }catch(e){
            console.log(e);
        }
    }

    /**
     * 查询用户信息
     * */
    async getUserInfo(id){
        try{
            let sql = "SELECT * FROM user WHERE user_id = " + id;
            let list = await getIndex(sql);
            return list;
        }catch(e){
            console.log(e);
        }
    }

    /***
     * 查询用户任务
     * */
    async getSearchMyTask(obj){
        try{
            let sql = "SELECT a.*,b.name, b.point,b.img FROM task AS a LEFT JOIN merchant_task AS b ON a.mertask_id = b.id WHERE a.user_id=" + obj.ids +" ORDER BY a.id DESC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
            let list = await getIndex(sql);
            return list;
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 查询用户任务条数
     * **/
    async getMyTaskCount(obj){
        try{
            let sql = "SELECT count(1) as count  FROM task  WHERE user_id=" + obj.ids ;
            let list = await getIndex(sql);
            return list;
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 查询用户积分
     * */

    async getSearchMyIntegral(obj){
        try{
            let sql = "SELECT * FROM user_point_detail WHERE user_id = " + obj.ids + " ORDER BY id DESC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
            let list = await getIndex(sql);
            return list;
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 查询我的积分总数
     * **/
    async getMyIntegralCount(obj){
        try{
            let sql = "SELECT count(1) AS count FROM user_point_detail WHERE user_id = " + obj.ids;
            let list = await getIndex(sql);
            return list;
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 查询用户礼品
     * **/
    async getSearchMyGift(obj){
        try{
            let sql = "SELECT a.*,b.name,b.icon,c.status,c.updatetime AS uptime,c.expressnum,c.express FROM user_point_detail AS a " +
                "LEFT JOIN item AS b ON a.relat_id = b.id " +
                "LEFT JOIN point_exchange_item AS c ON a.orderId = c.id " +
                "WHERE a.type = 1 AND a.user_id = " + obj.ids + " ORDER BY a.id DESC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
            let list = await getIndex(sql);
            return list;
        }catch(e){
            console.log(e);
        }
    }
    /**查询用户礼品数量**/
    async getMyGiftCount(obj){
        try{
            let sql = "SELECT count(1) as count FROM user_point_detail WHERE type = 1 AND user_id = " + obj.ids + "";
            let list = await getIndex(sql);
            return list;
        }catch(e){
            console.log(e);
        }
    }

    /**
     * 查询用户积分，礼品积分,供应商id三合一
     * **/
    async getPointAll(userId,itemId){
        let sql = "SELECT point FROM user WHERE user_id = " + userId;
        let sql1 = "SELECT name,point FROM item WHERE id = " + itemId;
        let sql2 = "SELECT sup_id,leftcount FROM supplier_item WHERE itemid=" + itemId;
        let sqlFun = [await getIndex(sql),await getIndex(sql1),await getIndex(sql2)];
        return sqlFun;
    }

    /**
     * 查询用户积分
     * **/
    async getUserPoint(userId){
        try {
            let sql = "SELECT point FROM user WHERE user_id = " + userId;
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 根据供应商id获取供应商积分
     * **/
    async getSupplierPoint(id){
        try{
            let sql = "SELECT point FROM supplier WHERE id=" +id;
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }

    /**
     * 用户做任务
     * **/
    async postGetDoTask(obj){
        let {  id, uptime, tid , nexttime,endtime,platform } = obj;
        try{
            //任务减积分，任务积分数，任务前冻结积分，商家旧总冻结积分，商家id，商家新总冻结积分
            let freezeMerPoint,point,freezepoint,freeAllPoint,merId,newFreeAllPoint;
            let sql1 = "SELECT freezepoint,point,mer_id FROM merchant_task WHERE id = "+tid;
            let oks = await getIndex(sql1).then(async res=>{
                merId = res.data[0].mer_id;
                freezepoint = res.data[0].freezepoint;
                point = res.data[0].point;
                freezeMerPoint = freezepoint - point;
                let sql2 = "SELECT frozenpoint FROM merchanter WHERE id = " + merId;
                return await getIndex(sql2);
            }).then(async res=>{
                freeAllPoint = res.data[0].frozenpoint;
                newFreeAllPoint = freeAllPoint - point;
                // let sql3 = "INSERT INTO merchant_publish_task_point (prefreezepoint,freezepoint,createtime,updatetime,mer_id,task_id,user_id,type) VALUES ("+freeAllPoint+","+newFreeAllPoint+",'"+uptime+"','"+uptime+"',"+merId+","+tid+","+id+",0)";
                // let sql4 = "INSERT INTO task (mertask_id,user_id,step,user_accept_time,status,freeze,user_end_time) VALUES ("+tid+","+id+",0,'"+uptime+"',0,"+point+",'"+endtime+"')";
                // let sql5 = "UPDATE merchanter SET frozenpoint = "+newFreeAllPoint+",updatetime = '"+uptime+"' WHERE id = " + merId;
                // let sql6 = "UPDATE merchant_task SET freezepoint = "+freezeMerPoint+",updatetime = '"+uptime+"' WHERE id = " + tid;
                let sql3 = "INSERT INTO merchant_publish_task_point (prefreezepoint,freezepoint,createtime,updatetime,mer_id,task_id,user_id,type) VALUES (?,?,?,?,?,?,?,0)";
                let value3 = [freeAllPoint,newFreeAllPoint,uptime,uptime,merId,tid,id];
                let sql4 = "INSERT INTO task (mertask_id,user_id,step,user_accept_time,status,freeze,user_end_time) VALUES (?,?,0,?,0,?,?)";
                let value4 = [tid,id,uptime,point,endtime];
                let sql5 = "UPDATE merchanter SET frozenpoint = ?,updatetime = ? WHERE id = ?";
                let value5 = [newFreeAllPoint,uptime,merId];
                let sql6 = "UPDATE merchant_task SET freezepoint = ?,updatetime = ? WHERE id = ?" ;
                let value6 = [freezeMerPoint,uptime,tid];
                let sql7 = "";
                if(platform == 0){
                    sql7 = "UPDATE user SET tbcount = tbcount + 1 WHERE user_id = " + id;
                }else if(platform == 1){
                    sql7 = "UPDATE user SET jdcount = jdcount + 1 WHERE user_id = " + id;
                }else if(platform == 2){
                    sql7 = "UPDATE user SET pddcount = pddcount + 1 WHERE user_id = " + id;
                }
                let sql3s = {sql :sql3,value:value3};
                let sql4s = {sql :sql4,value:value4};
                let sql5s = {sql :sql5,value:value5};
                let sql6s = {sql :sql6,value:value6};
                return await getAffair([sql3s,sql4s,sql5s,sql6s,sql7]);
            }).catch(async res=>{
                let err = {
                    status : 400,
                    message : "参数错误",
                    data : []
                };
                return err;
            });
            return oks;
        }catch(e){
            console.log(e);
            return e;
        }
    }
    /**
     * 用户做任务一小时到期执行
     * **/
    async getUserTaskTimeOut(obj){
        try {
            let {id, tid, nowTime,platform} = obj;
            let merId,step,freeze,point;
            let sql1 = "SELECT mer_id FROM merchant_task WHERE id = " + tid;
            let oks = await getIndex(sql1).then(async res=> {
                merId = res.data[0].mer_id;
                let sql4 = "SELECT point FROM merchanter WHERE id = " + merId;
                return await getIndex(sql4);
            }).then(async res=>{
                point = res.data[0].point;
                let sql2 = "SELECT step,freeze FROM task WHERE user_id = " + id + " AND mertask_id = " + tid + "";
                return await getIndex(sql2);
            }).then(async res => {
                step = res.data[0].step;
                if (step == 0) {
                    freeze = res.data[0].freeze;
                    let newPoint = Number(point) + Number(freeze);
                    // let sql3 = "UPDATE task SET status = 2 WHERE user_id = " + id + " AND mertask_id = " + tid + "";
                    // let sql4 = "INSERT INTO merchant_point_detail (mer_id,time,ttype,point,reason,prepoint) VALUES ("+merId+",'"+nowTime+"',3,"+newPoint+",'id为"+tid+"的任务，"+id+"的用户未完成返还',"+point+")";
                    // let sql5 = "UPDATE merchanter SET point = point + "+freeze+" WHERE id = " + merId;
                    let sql3 = "UPDATE task SET status = 2 WHERE user_id = ? AND mertask_id = ?";
                    let value3 = [id,tid];
                    let sql4 = "INSERT INTO merchant_point_detail (mer_id,time,ttype,point,reason,prepoint) VALUES (?,?,3,?,?,?)";
                    let value4 = [merId,nowTime,newPoint,"id为"+tid+"的任务，"+id+"的用户未完成返还",point];
                    let sql5 = "UPDATE merchanter SET point = point + ? WHERE id = ?" ;
                    let value5 = [freeze,merId];
                    let sql6 = "";
                    if(platform == 0){
                        sql6 = "UPDATE user SET tbcount = tbcount - 1 WHERE user_id = " + id;
                    }else if(platform == 1){
                        sql6 = "UPDATE user SET jdcount = jdcount - 1 WHERE user_id = " + id;
                    }else if(platform == 2){
                        sql6 = "UPDATE user SET pddcount = pddcount - 1 WHERE user_id = " + id;
                    }
                    let sql3s = {sql :sql3,value:value3};
                    let sql4s = {sql :sql4,value:value4};
                    let sql5s = {sql :sql5,value:value5};
                    return await getAffair([sql3s,sql4s,sql5s,sql6]);
                }else{
                    return {
                        status : 200,
                        data : [],
                        message : "该任务用户已提交"
                    }
                }
            }).catch(async res => {
                 return {
                    status : 400,
                    data : [],
                    message : "参数错误"
                }
            });
            return oks;
        }catch(e){
            console.log(e);
        }
    }

    /**
     *插入一条记录到积分兑换表point_exchange_item
     生成用户积分操作记录,
     减少用户积分
     增加供应商积分
     插入一条记录到供应商积分表
     * **/
    async pointHandle(obj){
            //礼品id，用户id，供应商id，创建时间，订单状态（0未派件1已经派件），更新时间，礼品积分，用户积分类别(0完成评价任务1换取礼品2完成购买任务),用户积分，供应商新的积分，供应商老积分，供应商积分类别（0，用户换取礼品1供应商提现）
            let { itemid, userid, supplierid, createtime, status, updatetime, itemPoint,newUserPoint,type,userPoint,newSupPoint,supplierPoint,supType } = obj;
        try{
            let orderId;
            // let sql1 = "INSERT INTO point_exchange_item (userid,itemid,supplierid,createtime,status,updatetime,point) VALUES ("+userid+","+itemid+","+supplierid+",'"+createtime+"',"+status+",null,"+itemPoint+")";
            let sql1 = "INSERT INTO point_exchange_item (userid,itemid,supplierid,createtime,status,updatetime,point) VALUES (?,?,?,?,?,null,?)";
            let value = [userid,itemid,supplierid,createtime,status,itemPoint];
            return await getIndex(sql1,value).then(async res=> {
                if(res.status == 200) {
                    let orderId = res.data.insertId;
                    // let sql2 = "INSERT INTO user_point_detail (user_id,relat_id,type,prepoint,curpoint,reason,updatetime,orderId) VALUES (" + userid + "," + itemid + "," + type + "," + userPoint + "," + newUserPoint + ",null,'" + updatetime + "'," + orderId + ")";
                    // let sql3 = "INSERT INTO supplier_point_detail (sup_id,type,prepoint,point,updatetime,itemid,userid) VALUES (" + supplierid + "," + supType + "," + supplierPoint + "," + newSupPoint + ",'" + updatetime + "','" + itemid + "','" + userid + "')";
                    // let sql4 = "UPDATE supplier_item SET leftcount = leftcount - 1 WHERE itemid = " + itemid;
                    // let sql5 = "UPDATE user SET point = " + newUserPoint + " WHERE user_id = " + userid;
                    // let sql6 = "UPDATE supplier SET point = " + newSupPoint + " WHERE id = " + supplierid + "";
                    // return await getAffair([sql2, sql3, sql4, sql5, sql6]);
                    let sql2 = "INSERT INTO user_point_detail (user_id,relat_id,type,prepoint,curpoint,reason,updatetime,orderId) VALUES (?,?,?,?,?,null,?,?)";
                    let value2 = [userid,itemid,type,userPoint,newUserPoint,updatetime,orderId];
                    let sql3 = "INSERT INTO supplier_point_detail (sup_id,type,prepoint,point,updatetime,itemid,userid) VALUES (?,?,?,?,?,?,?)";
                    let value3 = [supplierid,supType,supplierPoint,newSupPoint,updatetime,itemid,userid];
                    let sql4 = "UPDATE supplier_item SET leftcount = leftcount - 1 WHERE itemid = ?";
                    let value4 = [itemid];
                    let sql5 = "UPDATE user SET point = ? WHERE user_id = ?";
                    let value5 = [newUserPoint,userid];
                    let sql6 = "UPDATE supplier SET point = ? WHERE id = ?";
                    let value6 = [newSupPoint,supplierid];
                    let sql2s = {sql : sql2, value : value2};
                    let sql3s = {sql : sql3, value : value3};
                    let sql4s = {sql : sql4, value : value4};
                    let sql5s = {sql : sql5, value : value5};
                    let sql6s = {sql : sql6, value : value6};
                    return await getAffair([sql2s,sql3s,sql4s,sql5s,sql6s]);
                }else{
                    let err = {
                        status: 400,
                        message: "参数错误",
                        data: []
                    }
                    return err;
                }
            }).catch(res=>{
                let err = {
                    status: 400,
                    message: "参数错误",
                    data: []
                }
                return err;
            });
        }catch(e){
            console.log(e);
            return e;
        }
    }

    /**
     * 获取首页banner图
     * status (0=>关闭,1=>开启)
     * */
    async indexBanner(){
        try{
            let sql = "SELECT * FROM banner WHERE status = 1 ORDER BY sort ASC";
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }

    /**
     * 获取新手教程
     * **/
    async postGetTutorial(){
        try{
            let sql = "SELECT * FROM tutorial";
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }


    /**
     * 获取首页礼品
     * **/
    async indexItem(obj){
        try{
            let { times,cid,type } = obj;
            // let sql = "SELECT a.id,a.name,a.icon,a.cid,a.point,a.goodtype,b.leftcount,b.rmb,b.endtime FROM item AS a LEFT JOIN supplier_item AS b ON a.id = b.itemid WHERE unix_timestamp('"+obj.times+"') < unix_timestamp(b.endtime)  AND (a.cid = "+obj.cid+" OR "+obj.cid+" is null) AND b.leftcount > 0 AND (a.goodtype = "+obj.type+" OR "+obj.type+" is null) ORDER BY a.id DESC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
            let sql = "SELECT a.id,a.name,a.icon,a.cid,a.point,a.goodtype,b.leftcount,b.rmb,b.endtime FROM item AS a LEFT JOIN supplier_item AS b ON a.id = b.itemid WHERE unix_timestamp(?) < unix_timestamp(b.endtime)  AND (a.cid = ? OR ? is null) AND b.leftcount > 0 AND (a.goodtype = ? OR ? is null) ORDER BY a.id DESC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
            let value = [times,cid,cid,type,type];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 获取礼品总数
     * **/
    async indexItemCount(obj){
        try{
            let { times,cid,type } = obj;
            // let sql = "SELECT count(1) AS count FROM item AS a INNER JOIN supplier_item AS b ON a.id = b.itemid WHERE b.leftcount > 0 AND unix_timestamp('"+obj.times+"') < unix_timestamp(b.endtime) AND (a.cid = "+obj.cid+" OR "+obj.cid+" is null)  AND (a.goodtype = "+obj.type+" OR "+obj.type+" is null)";
            let sql = "SELECT count(1) AS count FROM item AS a INNER JOIN supplier_item AS b ON a.id = b.itemid WHERE b.leftcount > 0 AND unix_timestamp(?) < unix_timestamp(b.endtime) AND (a.cid = ? OR ? is null)  AND (a.goodtype = ? OR ? is null)";
            let value = [times,cid,cid,type,type];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 获取礼品详情
     * **/
    async itemDetails(obj){
        try{
            // let sql = "SELECT a.*,b.leftcount,b.rmb,b.endtime FROM item AS a LEFT JOIN supplier_item AS b ON a.id = b.itemid WHERE a.id = "+obj.id+" AND a.cid = " + obj.cid +" AND unix_timestamp('"+obj.times+"') < unix_timestamp(b.endtime) ";
            let sql = "SELECT a.*,b.leftcount,b.rmb,b.endtime FROM item AS a LEFT JOIN supplier_item AS b ON a.id = b.itemid WHERE a.id = ? AND a.cid = ? AND unix_timestamp(?) < unix_timestamp(b.endtime) ";
            let value = [obj.id,obj.cid,obj.times];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 获取礼品分类
     * **/
    async getCategory(){
        try{
            let sql = "SELECT * FROM category WHERE status = 0 ORDER BY sort DESC";
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 查看用户该任务的详细
     * **/
    async postLookTask(obj){
        try{
            let { uid,id } = obj;
            // let sql = "SELECT a.*,b.name,b.keyword,b.point,b.price,b.mername,b.img,b.platform,b.url FROM task AS a LEFT JOIN merchant_task AS b ON a.mertask_id = b.id WHERE a.mertask_id = " + id + " AND a.user_id = " + uid;
            let sql = "SELECT a.*,b.name,b.keyword,b.point,b.price,b.mername,b.img,b.platform,b.url FROM task AS a LEFT JOIN merchant_task AS b ON a.mertask_id = b.id WHERE a.mertask_id = ? AND a.user_id = ?";
            let value = [id,uid];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 获取该用户做了多少数量
     * **/
    async postUserCount(obj){
        try{
            let sql = "SELECT taobao,jingdong,pingduoduo,pddcount,jdcount,tbcount FROM user WHERE user_id = " + obj.id;
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }

    /**
     * 获取该用户是否做了该任务
     * **/
    async postgetDoTaskIsOk(obj){
        try{
            let { id,tid } = obj;
            let sql = "SELECT id FROM task WHERE user_id = "+id+" AND mertask_id = "+tid+" ";
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 获取该任务是哪个平台的
     * **/
    async postPlatFormData(obj){
        try{
            let { tid } = obj;
            let sql = "SELECT platform FROM merchant_task WHERE id = " + tid;
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }
    /***
     * 获取该平台一个用户一个月能做的数量
     * \**/
    async postPlatCount(){
        let sql = "SELECT * FROM config WHERE id = 1;";
        return await getIndex(sql);
    }
    /**
     * 查看该任务状态
     * **/
    async postGetTaskStatus(obj){
        try{
            let {id,orderId, img,uid,uptime} = obj;
            // let sql = "SELECT step,status FROM task WHERE mertask_id = "+id+" AND user_id = "+uid+"";
            let sql = "SELECT step,status FROM task WHERE mertask_id = ? AND user_id = ?";
            let value = [id,uid];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 提交任务
     * **/
    async postGetSubTask(obj){
        try{
            let {id,orderId, img,uid,uptime} = obj;
            // let sql = "UPDATE task SET user_icon = '"+img+"' ,user_order = '"+orderId+"',step = 1, user_finish_time = '"+uptime+"' ,approve = 0 WHERE mertask_id = "+id+" AND user_id = "+uid+"";
            let sql = "UPDATE task SET user_icon =? ,user_order = ?,step = 1, user_finish_time =? ,approve = 0 WHERE mertask_id = ? AND user_id = ?";
            let value = [img,orderId,uptime,id,uid];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 获取任务详情
     * **/
    async taskDetails(obj){
        try{
            let { ids,uptime } = obj;
            // let sql = "SELECT id AS mertask_id,name,keyword,mername,price,img,point,starttime,endtime AS taskendtime,sex,age,createtime,onehours,hours,platform,url FROM merchant_task WHERE status = 0 AND ('"+uptime+"' BETWEEN starttime AND endtime) AND id = " + ids;
            let sql = "SELECT id AS mertask_id,name,keyword,mername,price,img,point,starttime,endtime AS taskendtime,sex,age,createtime,onehours,hours,platform,url FROM merchant_task WHERE status = 0 AND (? BETWEEN starttime AND endtime) AND id = ?";
            let value = [uptime,ids];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 获取首页任务条数
     * **/
    async indexTaskCount(obj){
        try{
            let { sex,ages,uptime,userid } = obj;
            // let sql = "SELECT count(1) AS count FROM merchant_task WHERE "+userid+" not in (SELECT user_id FROM task WHERE task.mertask_id = merchant_task.id) AND status = 0 AND (sex = "+sex+" OR sex = 0) AND (age = "+ages+" OR age = 0) AND ('"+uptime+"' BETWEEN starttime AND endtime)";
            let sql = "SELECT count(1) AS count FROM merchant_task WHERE ? not in (SELECT user_id FROM task WHERE task.mertask_id = merchant_task.id) AND status = 0 AND (sex = ? OR sex = 0) AND (age = ? OR age = 0) AND (? BETWEEN starttime AND endtime)";
            let value = [userid,sex,ages,uptime];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /***
     * 获取该用户的年龄以及性别
     * **/
    async indexUserAge(ids){
        try{
            let sql = "SELECT sex,age FROM user WHERE user_id = " + ids;
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 签到加积分
     * **/
    async getUserSign(obj){
        try{
            let { ids,sign,uptime} = obj;
            let sql1 = "SELECT user_name,point FROM user WHERE user_id = " + ids;
            console.log(sql1);
            let oks = await getIndex(sql1).then(async res=>{
                console.log(res);
                let userName = decodeURIComponent(res.data[0].user_name).replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
                let oldpoint = res.data[0].point;
                let newpoint = Number(res.data[0].point) + Number(1);
                // let sql2  = "INSERT INTO user_point_detail (user_id,relat_id,type,prepoint,curpoint,reason,updatetime,orderId) VALUES ("+ids+",0,4,"+oldpoint+","+newpoint+",'签到积分','"+uptime+"',0)";
                // let sql3  = "UPDATE user SET sign = '"+sign+"',point = point + 1 WHERE user_id = " + ids;
                // let sql4 = "INSERT INTO admin_finance (type,uptime,point,reason) VALUES (3,'"+uptime+"',1,'用户"+userName+"在"+uptime+"时签到')";
                // let sql5 = "UPDATE admin SET qiandao = qiandao + 1 WHERE id = 1";
                // return await getAffair([sql2,sql3,sql4,sql5]);
                let sql2  = "INSERT INTO user_point_detail (user_id,relat_id,type,prepoint,curpoint,reason,updatetime,orderId) VALUES (?,0,4,?,?,'签到积分',?,0)";
                let value2 = [ids,oldpoint,newpoint,uptime];
                let sql3  = "UPDATE user SET sign = ?,point = point + 1 WHERE user_id = ?";
                let value3 = [sign,ids];
                let sql4 = "INSERT INTO admin_finance (type,uptime,point,reason) VALUES (3,?,1,?)";
                let value4 = [uptime,"用户"+userName+"在"+uptime+"时签到"];
                let sql5 = "UPDATE admin SET qiandao = qiandao + 1 WHERE id = 1";

                let sql2s = {sql : sql2, value : value2};
                let sql3s = {sql : sql3, value : value3};
                let sql4s = {sql : sql4, value : value4};

                return await getAffair([sql2s,sql3s,sql4s,sql5]);
            }).catch(async res=>{
                let err = {
                    status : 400,
                    message : "参数错误",
                    data : []
                }
                return err;
            });
            return oks;
        }catch(e){
            console.log(e);
        }
    }

    /**
     * 查询签到数量
     * **/
    async getPostSign(ids){
        try{
            let sql = "SELECT sign FROM user WHERE user_id = " + ids;
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 获取首页任务
     * obj.sort
     *  1=>积分正序 2=>积分倒序
     *  3=>时间正序 4=>时间倒序
     * **/
    async indexTask(obj){
        try{
            let sql = "";
            let value = [];
            let {ages,sex,uptime,userid} = obj;
            switch(parseInt(obj.sort)){
                case 1:
                    // sql = "SELECT id,name,point,img,endtime FROM merchant_task WHERE "+userid+" NOT IN (SELECT user_id FROM task WHERE task.mertask_id = merchant_task.id) AND status = 0 AND (sex = "+sex+" OR sex = 0) AND (age = "+ages+" OR age = 0) AND  ('"+uptime+"' BETWEEN starttime AND endtime) ORDER BY point ASC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
                    sql = "SELECT id,name,point,img,endtime FROM merchant_task WHERE ? NOT IN (SELECT user_id FROM task WHERE task.mertask_id = merchant_task.id) AND status = 0 AND (sex = ? OR sex = 0) AND (age = ? OR age = 0) AND  (? BETWEEN starttime AND endtime) ORDER BY point ASC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
                    value = [userid,sex,ages,uptime];
                    break;
                case 2:
                    sql = "SELECT id,name,point,img,endtime FROM merchant_task WHERE ? NOT IN (SELECT user_id FROM task WHERE task.mertask_id = merchant_task.id) AND status = 0 AND (sex = ? OR sex = 0) AND (age = ? OR age = 0) AND (? BETWEEN  starttime AND endtime) ORDER BY point DESC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
                    value = [userid,sex,ages,uptime];
                    break;
                case 3:
                    sql = "SELECT id,name,point,img,endtime FROM merchant_task WHERE ? NOT IN (SELECT user_id FROM task WHERE task.mertask_id = merchant_task.id) AND status = 0 AND (sex = ? OR sex = 0) AND (age = ? OR age = 0) AND (? BETWEEN  starttime AND endtime) ORDER BY starttime ASC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
                    value = [userid,sex,ages,uptime];
                    break;
                case 4:
                    sql = "SELECT id,name,point,img,endtime FROM merchant_task WHERE ? NOT IN (SELECT user_id FROM task WHERE task.mertask_id = merchant_task.id) AND status = 0 AND (sex = ? OR sex = 0) AND (age = ? OR age = 0) AND (? BETWEEN  starttime AND endtime) ORDER BY starttime DESC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
                    value = [userid,sex,ages,uptime];
                    break;
                default :
                    sql = "SELECT id,name,point,img,endtime FROM merchant_task WHERE ? NOT IN (SELECT user_id FROM task WHERE task.mertask_id = merchant_task.id) AND status = 0 AND (sex = ? OR sex = 0) AND (age = ? OR age = 0) AND (? BETWEEN  starttime AND endtime) LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
                    value = [userid,sex,ages,uptime];
                    break;
            }
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }

    /**
     * 获取该用户的评价任务
     * **/
    async postEvalTask(obj){
        // let sql = "SELECT a.*,b.name,b.mername FROM eval_task AS a LEFT JOIN merchant_task AS b ON a.task_id = b.id WHERE a.user_id = "+obj.userid+" ORDER BY a.id DESC LIMIT " + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
        let sql = "SELECT a.*,b.name,b.mername FROM eval_task AS a LEFT JOIN merchant_task AS b ON a.task_id = b.id WHERE a.user_id = ? ORDER BY a.id DESC LIMIT "  + (obj.pageIndex - 1) * obj.pageSize + "," + obj.pageSize + "";
        let value = [obj.userid];
        return await getIndex(sql,value);
    }
    /**
     * 获取该用户评价任务总数
     * **/
    async postEvalTaskUserCount(obj){
        // let sql = "SELECT count(1) AS count FROM eval_task WHERE user_id = "+obj.userid+"";
        let sql = "SELECT count(1) AS count FROM eval_task WHERE user_id = ?";
        let value = [obj.userid];
        return await getIndex(sql,value);
    }
    /**
     * 获取该用户是否有新的评价任务
     * **/
    async postEvalTaskCount(ids){
        // let sql = "SELECT count(1) AS count FROM eval_task WHERE user_id = "+ids+" AND type = 1";
        let sql = "SELECT count(1) AS count FROM eval_task WHERE user_id = ? AND type = 1";
        let value = [ids];
        return await getIndex(sql,value);
    }
    /**
     * 用户接受评价任务
     * **/
    async postAcceptEvalTask(obj){
        let { id,userid,uptime } = obj;
        // let sql = "UPDATE eval_task SET type = 2,updatetime = '"+uptime+"' WHERE user_id = "+userid+" AND id = " + id;
        let sql = "UPDATE eval_task SET type = 2,updatetime =? WHERE user_id = ? AND id = ?";
        let value = [uptime,userid,id];
        return await getIndex(sql,value);
    }
    /**
     * 用户提交评价任务
     * **/
    async postSubEvalTask(obj){
        let { id,userid,uptime } = obj;
        // let sql = "UPDATE eval_task SET endtime = '"+uptime+"',updatetime= '"+uptime+"',type = 3 WHERE user_id = "+userid+" AND id = " + id;
        let sql = "UPDATE eval_task SET endtime =?,updatetime=?,type = 3 WHERE user_id = ? AND id = ?";
        let value = [uptime,uptime,userid,id];
        return await getIndex(sql,value);
    }
    /**
     * 是否已进代理
     * **/
    async postIsOkAgency(obj){
        try{
            let { uId } = obj;
            let sql = "SELECT sublevel FROM user WHERE user_id = " + uId;
            return await getIndex(sql);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 代理
     * **/
    async postAgency(obj){
        try{
            let { uId,userId } = obj;
            // let sql = "UPDATE user SET sublevel = "+userId+" WHERE user_id = " + uId;
            let sql = "UPDATE user SET sublevel =? WHERE user_id = ?";
            let value = [userId,uId];
            return await getIndex(sql,value);
        }catch(e){
            console.log(e);
        }
    }
    /**
     * 用户分享
     * **/
    async postShare(obj){
        try {
            let {userId, uId, uptime, userName} = obj;
            let sql = "SELECT point,share FROM user WHERE user_id = " + userId;
            let oks = await getIndex(sql).then(async res => {
                if (res.data[0].share == 1) {
                    return {
                        data: [],
                        message: "该用户已经领取分享积分",
                        status : 200
                    }
                } else {
                    let userPoint = res.data[0].point;
                    let newUserPoint = Number(userPoint) + Number(5);
                    let sql1 = "UPDATE user SET point = point + 5,share = 1 WHERE user_id = " + userId;
                    // let sql2 = "INSERT INTO user_point_detail (user_id,relat_id,type,prepoint,curpoint,reason,updatetime,orderId) VALUES (" + userId + ",0,6," + userPoint + "," + newUserPoint + ",'用户" + userName + "进入了您的分享链接','" + uptime + "',0)";
                    let sql2 = "INSERT INTO user_point_detail (user_id,relat_id,type,prepoint,curpoint,reason,updatetime,orderId) VALUES (?,0,6,?,?,?,?,0)";
                    console.log(sql2);
                    let value = [userId,userPoint,newUserPoint,"用户" + userName + "进入了您的分享链接",uptime];
                    return await getAffair([sql1,(sql2,value)]);
                }
            }).catch(async res => {
                let err = {
                    status: 400,
                    message: "参数错误",
                    data: []
                }
                return err;
            });
            return oks;
        }catch(e){
            console.log(e);
        }
    }


    /**
     * 新增用户
     * **/
    async postAddUser(obj){
        let {openid,nickname,headimgurl,uptime,sex} = obj;
        // let sql = "INSERT INTO user (tencent_openid,user_name,sex,created_at,last_login_time,status,point,img,agency,share,age) VALUES ('"+openid+"','"+nickname+"',"+sex+",'"+uptime+"','"+uptime+"',0,0,'"+headimgurl+"',0,0,0)";
        let sql = "INSERT INTO user (tencent_openid,user_name,sex,created_at,last_login_time,status,point,img,agency,share,age) VALUES (?,?,?,?,?,0,0,?,0,0,0)";
        let value = [openid,nickname,sex,uptime,uptime,headimgurl];
        return await getIndex(sql,value);
    }
    /**
     * 用户最后登录时间
     * **/
    async postUserLastLoginTime(obj){
        let {id,uptime} = obj;
        let sql = "UPDATE user SET last_login_time = ? WHERE user_id = ?";
        let value = [id,uptime];
        return await getIndex(sql,value);
    }
}
module.exports = new getIndexSql();
