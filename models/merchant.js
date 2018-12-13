let getIndex = require("../lib/mysql");
let moment = require("moment");
//merchant  商家
class getMerIndexSql{
    /**
     * 查询商家信息
     * */
    async findMerchantPointById(id){
        try{
            let sql = "select id,name,frozenpoint,point,createtime from merchant_point where id = " + id;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 插入商家信息
     * */
    async insertMerchantPoint(obj){
        try{
            let {name,frozenpoint,point,createtime} = obj;
            let sql = "insert into merchant_point(name,frozenpoint,point,createtime) values('" + name + "',"+frozenpoint+"," + point + "," + createtime +" )";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 更新商家信息
     * */
    async updateMerchantPoint(obj){
        try{
            let {name,frozenpoint,point,createtime} = obj;
            let sql = "update merchant_point(name,frozenpoint,point,createtime) set name='" + name + "',set frozenpoint="+frozenpoint+",set point=" + point + ", set createtime=" + createtime +" )";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     * 商家分页信息
     * */
    async getMerchantPointList(obj){
        try{
            let { pageidx, pagesize} = obj;
            let sql = "select id,name,frozenpoint,point,createtime from merchant_point order by id limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 发布任务
     * */
    async insertMerchantTask(obj) {
        try{
            let {mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex} = obj;
            let sql = "insert into merchant_task(mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex) values(" + mer_id + "," + item_id + ",'" + name + "'," + perhour + "," + point + ","
                + starttime + "," + endtime + "," + status + ","+price+","+sex+" )";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /***
     * 根据id获取某商家某任务
     */
    async getMerchantTaskById(id) {
        try{
            let sql = "select mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex from merchant_task where id="+id;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     * 查询某店家任务
     * */
    async getMerchantTask(obj) {
        try{
            let {id, pageidx, pagesize} = obj;
            let sql = "select mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex from merchant_task where mer_id="+mer_id + "order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     * 查询任务分页
     * */
    async getMerchantTask(obj) {
        try{
            let {id, pageidx, pagesize} = obj;
            let sql = "select mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex from merchant_task " + "order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 修改店家任务
     * */
    async updateMerchantTask(obj) {
        try{
            let {mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex} = obj;
            let sql = "update merchant_point(mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex) set mer_id=" + mer_id +
                ", item_id=" + item_id + ", name='" + name + "', perhour="+perhour+",point="+point+",starttime='"+starttime+"',endtime='"+endtime+"',status="+status+",price="+price+",sex="+sex;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /****
     *插入商家积分明细表
     */
    async insertMerchantPointDetail(obj){
        try{
            let {user_id,mertask_id,mer_id,time,type,frozenpoint,point,reason} = obj;
            let sql = "insert into merchant_point_detail(user_id,mertask_id,mer_id,time,ttype,frozenpoint,point,reason) values(" + user_id + "," + mertask_id + ","+mer_id + ","+ time + "," + frozenpoint + "," + point + ",'"
                + reason + "')";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /***
     * 0 按照时间排序 2 按照积分排序
     * 1:查询商家ID积分明细表按照商家查询查询分页
     * 2:直接查询分页【总的】
     * 3:按照用户ID查询分页
     * 4:按照用户ID、商家ID查询分页
     * 5:按照时间区间查询总的
     * 6:按照时间区间查询商家ID总的分页
     * 7:按照任务模板类型ID分页
     */
    async getMerchantPointDetailById(obj){
        try{
            let {opt,merid,mertask_id,userid,starttime,endtime,pageidx, pagesize} = obj;
            let sql = "";
            let ret = {};
            switch (opt) {
                case 1:
                    sql = "select user_id,mertask_id,mer_id,time,ttype,frozenpoint,point,reason from merchant_point_detail where mer_id=" + merid + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 2:
                    sql = "select user_id,mertask_id,mer_id,time,ttype,frozenpoint,point,reason from merchant_point_detail  order by id desc limit "  + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 3:
                    sql = "select user_id,mertask_id,mer_id,time,ttype,frozenpoint,point,reason from merchant_point_detail where user_id=" +  userid +  " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 4:
                    sql = "select user_id,mertask_id,mer_id,time,ttype,frozenpoint,point,reason from merchant_point_detail where user_id=" +  userid + " and merid=" + merid + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 5:
                    sql = "select user_id,mertask_id,mer_id,time,ttype,frozenpoint,point,reason from merchant_point_detail where UNIX_TIMESTAMP(time)>=" + starttime +  " and  UNIX_TIMESTAMP(time) <="  +  endtime  + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 6:
                    sql = "select user_id,mertask_id,mer_id,time,ttype,frozenpoint,point,reason from merchant_point_detail where mer_id=" + merid +  "and UNIX_TIMESTAMP(time)>=" + starttime +  " and  UNIX_TIMESTAMP(time) <="  +  endtime  + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 7:
                    sql = "select user_id,mertask_id,mer_id,time,ttype,frozenpoint,point,reason from merchant_point_detail "+" where mertask_id=" + mertask_id + " order by id desc limit "  + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                default:{
                    return ret;
                }
            }
            ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /***
     * 查询按照分页
     */
    async getMerchantPointDetail(obj){
        try{
            let { pageidx, pagesize} = obj;
            let sql = "select user_id,mertask_id,time,ttype,frozenpoint,point,reason from merchant_point_detail "  + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     * 商家任务表,1：根据任务模板id获取任务,2：也可以根据商家查对应任务列表
     */
    async getMerchantTaskBy(obj){
        try{
            let {opt,id,mer_id,pageidx, pagesize} = obj;
            let  sql = "";
            switch (opt){
                case 1:
                    sql = "select mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex,age from merchant_task where  id =" + id;
                    break;
                case 2:
                    sql = "select mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex,age from merchant_task where  mer_id =" + mer_id + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break
                default:{
                    return {};
                }
            }
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 商家发布任务
     */
    async insertMerchantTask(obj){
        try{
            let {mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex,age} = obj;
            let sql = "insert into merchant_task(mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex,age) values(" + mer_id + "," + item_id + ",'"+name + "',"+ perhour + "," + point+
                ",'"+ starttime + "','" + endtime + "',"+status+","+price+","+ sex+","+ age+")";
            let ret = await getIndex(sql);
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 更新商家发布任务merchant_task
     */
    async updateMerchantTask(obj){
        try{
            let {mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex,age} = obj;
            let sql = "update merchant_task(mer_id,item_id,name,perhour,point,starttime,endtime,status,price,sex,age) set mer_id=" + mer_id +
                ", item_id=" + item_id + ", name='" + name + "', perhour="+perhour+",point="+point+",starttime='"+starttime+"',endtime='"+endtime+"',status="+status+",price="+price+",sex="+sex+",age="+age;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /*
    * 添加商家评价任务merchant_task
    * */
    async insertEvaluationTask(obj){
        try {
            let {mer_id,item_id,user_id,point,endtime,icon,content,status} = obj;
            let sql = "insert into evaluation_task(mer_id,item_id,user_id,point,endtime,icon,content,status) values(" + mer_id + "," + item_id + "," + user_id + "," + point + ",'"+ endtime+
                "','"+icon+"','"+content+"',"+status + ")";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /***
     * 修改商家评价任务
     **/
    async updateEvaluationTask(obj){
        try {
            let {mer_id,item_id,user_id,point,endtime,icon,content,status} = obj;
            let sql = "update evaluation_task(mer_id,item_id,user_id,point,endtime,icon,content,status) set mer_id=" + mer_id + ",item_id=" + item_id + ",user_id=" + user_id + ",point=" + point + ",endtime='"+ endtime+
                "',icon='"+icon+"',content='"+content+"',status="+status;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }





    /****
     * 1：根据用户id,查看评价任务
     * 2：根据用户id,status 查看评价任务
     * 3：根据商家id，查看用户评价任务列表
     * 4：根据商家id，status查看用户评价任务列表
     * 5: 根据商家id、用户id查询任务列表
     * 6: 根据商家id、用户id查询、status
     * 7: 查看所有用户评价任务列表
     *
     */
    async getEvaluationTask(obj){
        try{
            let {opt,mer_id,user_id,status,pageidx, pagesize} = obj;
            let sql = "";

           switch (opt) {
                case 1:
                    sql = "select id,mer_id,item_id,user_id,point,endtime,icon,content,status from evaluation_task where  user_id =" + user_id + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break
                case 2:
                    sql = "select id,mer_id,item_id,user_id,point,endtime,icon,content,status from evaluation_task where  user_id =" + user_id +  " and status="+ status  + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 3:
                    sql = "select id,mer_id,item_id,user_id,point,endtime,icon,content,status from evaluation_task where  mer_id =" + mer_id  + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 4:
                    sql = "select id,mer_id,item_id,user_id,point,endtime,icon,content,status from evaluation_task where  mer_id=" + mer_id  +" and status =" + status + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 5:
                    sql = "select id,mer_id,item_id,user_id,point,endtime,icon,content,status from evaluation_task where  user_id =" + user_id + " and mer_id=" + mer_id +" order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 6:
                    sql = "select id,mer_id,item_id,user_id,point,endtime,icon,content,status from evaluation_task where  user_id =" + user_id + " and mer_id=" + mer_id + " and status =" + status + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
                case 7:
                    sql = "select id,mer_id,item_id,user_id,point,endtime,icon,content,status from evaluation_task order by id desc limit " + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    break;
            }
        }catch (e) {
            console.log(e);
        }
    }


   /*
    * 插入task表
    * */
    async insertTask(obj){
        try {
            let {mertask_id,user_id,step,user_icon,mer_icon,user_accept_time,user_finish_time,mer_approval_time,reason,status} = obj;
            let sql = "insert into task(mertask_id,user_id,step,user_icon,mer_icon,user_accept_time,user_finish_time,mer_approval_time,reason,status) values(" + mertask_id + "," + user_id + "," + step + ",'" + user_icon + "','"+ mer_icon+
                "','"+user_accept_time+"','"+user_finish_time+"','"+mer_approval_time + "','" + reason  + "'," + status+ ")";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 修改task表
     */
    async updateTask(obj){
        try {
            let {mertask_id,user_id,step,user_icon,mer_icon,user_accept_time,user_finish_time,mer_approval_time,reason,status} = obj;
            let sql = "update task(mertask_id,user_id,step,user_icon,mer_icon,user_accept_time,user_finish_time,mer_approval_time,reason,status) set mertask_id=" + mertask_id + ",user_id=" + user_id + ",step=" + step + ",user_icon='" + user_icon + "',mer_icon='"+ mer_icon+
                "',user_accept_time='"+user_accept_time+"',user_finish_time='"+user_finish_time+"',mer_approval_time='"+mer_approval_time + "',reason='" + reason  + "'," + status+ ")";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     * 根据用户名获取商家管理员信息
     */
    async getMerchanter(obj) {
        try {
            let sql = "select user_name,password,real_name,phone_number,ip,last_login_time,reg_time,mer_id from merchanter where user_name='"+user_name+"'";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     *添加merchanter 商家管理员
     */
    async insertMerchanter(obj) {
        try{
            let {user_name,password,real_name,phone_number,ip,last_login_time,reg_time,mer_id} = obj;
            let sql = "insert into merchanter(user_name,password,real_name,phone_number,ip,last_login_time,reg_time,mer_id) values('" + user_name + "','"+
                    password + ",'" + real_name + "','" + phone_number + "'," + ip + "','" + last_login_time + "','" + reg_time + "'," + mer_id+" )";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 修改商家添加merchanter
     */
    async updateMerchanter(obj){
        try{
            let {user_name,password,real_name,phone_number,ip,last_login_time,reg_time,mer_id} = obj;
            let sql = "update  merchanter(user_name,password,real_name,phone_number,ip,last_login_time,reg_time,mer_id) set user_name='" + user_name + "',password='"+
                password + "',real_name='" + real_name + "',phone_number='" + phone_number + "',ip=" + ip + "',last_login_time='" + last_login_time + "',reg_time='" + reg_time + "'," + mer_id+" )";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }



    /**
     * 插入用户积分明细表user_point_detail
     */
    async insertUserPointDetail(obj){
        try{
            let {user_id,relat_id,type,prepoint,curpoint,reason,updatetime} = obj;
            let sql = "insert into user_point_detail(user_id,relat_id,type,prepoint,curpoint,reason,updatetime) values("+
                user_id+","+relat_id+","+type+","+prepoint+","+curpoint+",'"+reason+"','"+updatetime+"')";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     *  添加供应商supplier
     */
    async insertSupplier(obj){
        try{
            let {user_name,real_name,phone_number,ip,last_login_time,password,status,sup_id,point} = obj;
            let sql = "insert into supplier values(user_name,real_name,phone_number,ip,last_login_time,password,status,sup_id,point) values('"+user_name+"','"+real_name+"','"+phone_number+"','"+ip+"','"+last_login_time+
                "','"+password+"',"+status+","+sup_id+","+point+")";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     *  修改供应商supplier
     */
    async updateSupplier(obj){
        try{
            let {user_name,real_name,phone_number,ip,last_login_time,password,status,sup_id,point,id
            } = obj;
            let sql = "update supplier(user_name,real_name,phone_number,ip,last_login_time,password,status,sup_id,point) set user_name='"+user_name+"',real_name='"+real_name+"',phone_number='"+phone_number+"',ip='"+ip+"',last_login_time='"+last_login_time+
                "',password='"+password+"',status="+status+",sup_id="+sup_id+",point="+point+" where id=" + id;
        }catch(e) {
            console.log(e);
        }
    }


    /**
     *
     * 查看供应商信息根据供应商id supplier
     * 1:根据供应商id查管理员
     * 2:跟供应商管理员名字精准查
     * 3:供应商模糊查找
     */
    async findSupplierById(obj){
        try {
            let {opt,sup_id,user_name,pageidx,pagesize} = obj;
            switch (opt) {
                case 1:{
                    let sql = "select user_name,real_name,phone_number,ip,last_login_time,password,status,sup_id,point from supplier where sup_id=" + sup_id;
                    let ret = await getIndex(sql);
                    return ret;
                }
                break;
                case 2:{
                    let sql = "select user_name,real_name,phone_number,ip,last_login_time,password,status,sup_id,point from supplier where user_name='" + user_name+"'";
                    let ret = await getIndex(sql);
                    return ret;
                }
                case 3:{
                    let sql = "select user_name,real_name,phone_number,ip,last_login_time,password,status,sup_id,point from supplier where user_name like '%" + user_name+"%'" + " order by id desc limit " + (pageidx - 1)*pagesize  + " , "+  pageidx*pagesize;
                    let ret = await getIndex(sql);
                    return ret;
                }
                break;
            }

        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 获取供应商列表 supplier
     */
    async getSupplierList(obj){
        try{
            let {pageidx,pagesize} = obj;
            let sql = "select  user_name,real_name,phone_number,ip,last_login_time,password,status,sup_id,point from supplier "+ " order by id desc limit " + (pageidx - 1)*pagesize  + " , " + pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /***
     * 获取应商的积分分页 supplier_point --->按照积分逆序大到小
     */
    async getSupplierPointList(obj){
        try {
            let {pageidx,pagesize} = obj;
            let  sql = "select id,name,point,createtime,updatetime from supplier_point" + " order by point desc limit " + (pageidx - 1)*pagesize  + " , " + pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 插入供应商积分 supplier_point
     */
    async insertSupplierPoint(obj){
        try{
            let {name,point,createtime,updatetime} = obj;
            let sql = "insert into supplier_point values(name,point,createtime,updatetime,updatetime) values('"+name+"',"+point+",'"+createtime+"','"+updatetime+"')";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 更新供应商积分
     */
    async updateSupplierPoint(obj){
        try{
            let {point,updatetime,id} = obj;
            let sql = "update supplier_point(point,updatetime) set point="+point+",updatetime='"+updatetime+"'" + "where id="+id;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 查找供应商根据id
     * 1:供应商id查找
     * 2:供应商名字查找模糊
     */
    async findSupplierPoint(obj){
        try{
            let sql = "";
            let  {opt,id,name,pageidx,pagesize} = obj;
            let ret = {};
            switch (opt) {
                case 1:
                    sql = "select id,name,point,createtime,updatetime from supplier_point where id =" + id;
                    ret = await getIndex(sql);
                    return ret;
                case 2:
                    sql = "select id,name,point,createtime,updatetime from supplier_point where name like %'" + name + "%'"+ " order by id desc limit " + (pageidx - 1)*pagesize  + " , " + pageidx*pagesize;
                    ret = await getIndex(sql);
                    return ret;
            }
        }catch (e) {
            console.log(e);
        }
    }


    /**
     * 插入供应商的礼品的详情 supplier_item
     *
     */
    async insertSupplierItem(obj){
        try{
           let {sup_id,itemid,leftcount,uptime,total}  = obj;
           let sql = "insert into supplier_item(sup_id,itemid,leftcount,uptime,total) values("+sup_id+","+itemid+","+leftcount+",'"+uptime+"',"+total+")";
           let ret = await getIndex(sql);
           return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 更新供应商礼品详情 supplier_item
     */
    async updateSupplierItem(obj){
        try{
            let {sup_id,itemid,leftcount,uptime,total}  = obj;
            let sql = "update supplier_item(sup_id,itemid,leftcount,uptime,total) set leftcount="+leftcount+",uptime='"+uptime+"',total="+total+" where sup_id="+sup_id+" and itemid="+itemid;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 根据供应商id来获取所有礼品详情
     */
    async getSupplierItem(obj){
        try{
            let {sup_id,pageidx,pagesize} = obj;
            let sql = "select a.sup_id,a.itemid,a.leftcount,a.uptime,a.total,b.id,b.name,b.icon,b.point from supplier_item as a left join item as b where sup_id=" + sup_id + " on a.itemid = b.id order by a.id desc limit " + (pageidx - 1)*pagesize  + " , " + pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 供应商积分详情 supplier_point_detail
     *
     */
    async insertSupplierPointDetail(obj){
        try {
            let {sup_id,type,point,updatetime} = obj;
            let sql = "insert into  supplier_point_detail(sup_id,type,point,updatetime) values("+sup_id+","+type+","+point+",'"+updatetime+"')"
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 查询供应商的积分详情，按照时间段
     */
    async getSupplierPointDetailByTimeZone(obj){
        try{
            let {sup_id,starttime,endtime,pageidx,pagesize} = obj;
            let sql = "select id,type,point,updatetime from supplier_point_detail where updatetime >= '" + starttime + " and updatetime <= " + endtime + " order by id desc limit " + (pageidx - 1)*pagesize  + " , " + pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;

        }catch (e) {
            console.log(e);
        }
    }



    /**
     * 添加商城积分merchant_point
     */
    async insertMerchantPoint(obj){
        try{
            let {name,frozenpoint,point,createtime,updatetime} = obj;
            let sql = "insert into merchant_point(name,frozenpoint,point,createtime,updatetime) values('" + name+ "'," + frozenpoint+","+point+",'"+createtime+"','"+ updatetime+"')";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /*
    *修改商城积分merchant_point
     */
    async updateMerchantPoint(obj) {
        try{
            let {id,frozenpoint,point,updatetime} = obj;
            let sql = "update merchant_point set point=" + point + " and  frozenpoint=" + frozenpoint + " and  updatetime='" + updatetime+ "'" + " where id = " + id;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     * 查看商家积分分页
     * getMerchantPointList
     */
    async getMerchantPointList(obj){
        try{
            let {pageidx,pagesize} = obj;
            let sql = "select name,frozenpoint,point,createtime,updatetime from merchant_point " + " order by point desc limit " + (pageidx - 1)*pagesize  + " , " + pageidx*pagesize;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }




    /**
     *
     *添加refercode
    */
    async addReferCode(obj){
        try {
            let {userid,code,regtime} = obj;
            let sql = "insert into refercode(userid,code,regtime) values("+userid+"',"+code+"','"+regtime+"')"
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     *
     *删除refercode
     */
    async delReferCode(obj){
        try {
            let {userid,code,regtime} = obj;
            let sql = "delete from refercode where userid=" + userid;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }



    /**
     * 添加banner
     */
    async addBanner(obj){
        try{
            let {item_id,img,status,sort} = obj;
            let sql = "insert banner(item_id,img,status,sort) values("+item_id+",'"+img+"',"+status+","+sort+ ")";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }



    /**
     * 修改banner
     */
    async updateBanner(obj) {
        try {
            let {item_id,img,status,sort} = obj;
            let sql = "udpate banner set item_id=" + item_id + " , img='" + img + "',status=" + status + ",sort=" + sort + ")";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }


    /**
     *  按照排序banner
     */
    async getBannerList(obj){
        try {
            let sql = "select item_id,img,status,sort from banner where status=1  order by sort desc"
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * category 添加
     */
    async addCategory(obj){
        try {
            let {name,sort,status} = obj;
            let sql = "insert into category(name,sort,status) values('"  + name+ "',"  + sort + ","+status+")";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }




    /**
     * category 修改
     */
    async updateCategory(obj){
        let {name,sort,status} = obj;
        let sql = "update category  set name='"  + name+ "',sort="  + sort + ",status="+status+" where id=" + id;
        try {
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(sql+e);
        }
    }


    /**
     * category  查询排序
     */
    async getCategoryList(obj){
        let sql = "select name,sort,status from category where status = 1 order by sort asc"
        try {
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(sql+e);
        }
    }

    
}
module.exports = new getMerIndexSql();
