const getIndex = require("../lib/mysql").getIndex;
const getAffair = require("../lib/mysql").getAffair;
const mysql = require("mysql");
//数据请求
class getIndexSql{
    constructor(){
    }
    /**
     * 查询推广码
     * **/
    async queryActivationUser(obj)
    {
        try {
            let sql = "select data,userid,numberpaic,integral from redeem_activation_user where userid ="+obj.user_id;
            console.log(sql);
            return await getIndex(sql);//这里返回的是一个promise对象,
        } catch (error) {
         console.log(error);
        }
    }
/**
     * 根据用户ID查询推广码是否存在
     * **/
    async queryCodeAre(obj)
    {
        try {
            let sql = "SELECT regional_code,code_rules_id,flag FROM redeem_activation_code where regional_code = '" + obj.regional_code + "'";
            console.log(sql);
            return await getIndex(sql);
           } catch (error) {
               console.log(error);
           }
    }
     /**
     * 根据用户ID查询推广码是否绑定过推广码
     * **/
    async queryCodeID(obj)
    {
        try {
            let sql = "SELECT userid FROM redeem_activation_code where userid = " + obj.user_id ;
            console.log(sql);
            return await getIndex(sql);
           } catch (error) {
               console.log(error);
           }
    }
     /**
     * 查询推广码面额周期 redeem_activation_rules
     * **/
    async querydenomination_cycle(obj)
   {
        try {
            let sql = "select denomination,denomination_cycle from redeem_activation_rules where id = "+ obj.code_rules_id;
            console.log(sql);
            return await getIndex(sql);
        } catch (error) {
            console.log(error);
        }
   }
   async queryUserPoint(obj)
   {
        try {
            let sql ="select point from user where user_id ="+ obj.user_id;
            console.log(sql);
            return await getIndex(sql);
        } catch (error) {
            console.log(error);
        }
   }
    /**
     * 插入兑换推广码积分表
     * **/
    async insertredeem(obj){
        try {
            let sql1 = "update redeem_activation_code set flag = 1,updatetime = "+mysql.escape(obj.time)+",userid ="+obj.user_id+" where regional_code ="+mysql.escape(obj.regional_code)+"";
            let sql2 = "update redeem_activation_rules set flag = 1  where id="+obj.code_rules_id+" ";
            let sql3=  "insert into redeem_activation_user(userid,updatetime,data,code,numberpaic,integral) values("+obj.user_id+","+mysql.escape(obj.time)+","+mysql.escape(obj.pointtime)+","+mysql.escape(obj.regional_code)+",0,"+obj.integral+")";
            let sql4 = "insert into redeem_activation_user_detail values(null, "+obj.user_id+","+mysql.escape(obj.userPoint)+","+mysql.escape(obj.time)+","+mysql.escape(obj.regional_code)+")";
            return await getAffair([sql1,sql2,sql3,sql4]);
        } catch (error) {
            console.log('插入兑换表redeem_activation_user失败');
            console.log(error);
        }
    }
     /**
     * 插入exchange详情 - 更新code表用户绑定 - 更新用户积分
     * **/
   async insertActivationExchange(obj)
   {
        try {
			let sql1 = "SELECT user_name,point FROM user WHERE user_id = "+obj.userid+"";
            let oks = await getIndex(sql1).then(async res=>{
			let oldpoint = res.data[0].point;
			let newpoint = Number(oldpoint) + Number(obj.point);
            let sql2 = "insert into redeem_activation_exchange(user_id,credits,creditstime) values("+obj.userid+","+mysql.escape(obj.point)+","+mysql.escape(obj.time) +");";
            let sql3 = "update redeem_activation_user set data="+ mysql.escape(obj.data) + ",numberpaic = numberpaic + "+obj.numberpaic+", integral = integral - "+obj.point+" where userid=" + obj.userid;//", integral = integral - " ?????是减吗????
            let sql4 ="update user set point = point +"+mysql.escape(obj.point)+" where user_id = "+obj.userid;
			let sql5  = "insert into user_point_detail (user_id,relat_id,type,prepoint,curpoint,reason,updatetime,orderId) VALUES ("+obj.userid+",0,7,"+oldpoint+","+newpoint+",'领取积分',"+mysql.escape(obj.time) +",0)";
            return await getAffair([sql2,sql3,sql4,sql5]);
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
        }
	}
}
module.exports = new getIndexSql();