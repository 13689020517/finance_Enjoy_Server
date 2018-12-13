let getIndex = require("../lib/mysql");
class getItemIndexSql{
    /**
     * 查询物品信息
     * */
    async findItemById(id){
        try{
            let sql = "select id,itype,cid,name,icon,content from item where id = " + id;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 插入物品信息
     * */
    async insertItem(obj){
        try{
            let {itype,cid,name,icon,content} = obj;
            let sql = "insert into item(itype,cid,name,icon,content) values(" + itype + " , " + cid + " , '" + name + "' , '" + icon  + "','" + content + "')";
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 更新物品信息
     * */
    async updateItem(obj){
        try{
            let {id,itype,cid,name,icon,content} = obj;
            let sql = "update item set itype=" + itype + ",cid=" + cid + "," + "name='" + name  + "',"+"icon='"+icon+"',content='"+ content + "') where id=" + id;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 删除物品信息
     * */
    async delItem(id){
        try{
            let sql = "delete item where id="  + id;
            let ret = await getIndex(sql);
            return ret;
        }catch (e) {
            console.log(e);
        }
    }







}

module.exports = new getItemIndexSql();
