const getSql = require("../models/db");
const utils = require("../lib/utils");
const ErrorCode = require('../lib/ErrorCode');
const getRedis = require("../lib/getRedis");
const muilter = require("../lib/multerUtil");
const getSession = require("../lib/getSession");
class oAuth {
    constructor() {

    };
    /**
     * 获取首页banner
     * */
    async getBanner(req,res,next){
        let pager = {};
        let cbData = await getSql.indexBanner();
        pager.code = cbData.status;
        pager.data = cbData.data;
        return res.json(pager);
    }

    /**
     * 新手教程列表
     * **/
    async pGetTutorial(req,res,next){
        let pager = {};
        let cbData = await getSql.postGetTutorial(req.body);/*let cbDatas = { message : "操作成功",status : 200,data : rows};*/
        //cbData的状态码和数据赋值给pager
        pager.data = cbData.data;
        pager.code = cbData.status;
        return res.json(pager);
    }

    /**
     * 兑换记录
     * **/
    async pEexchangeItemList(req,res,next){
        let cbData = await getSession.getExchangeItemList("itemlist");
        let pager = {
            data : cbData,
            message : "查询成功",
            code : 200
        };
        return res.json(pager);
    }

    /**
     * 获取首页礼品列表
     *
     * **/
    async getItem(req,res,next){
        let pager = {};
        if(utils.isNull(req.body.pageIndex) || utils.isNull(req.body.pageSize) || !utils.isNumber(req.body.pageIndex) || !utils.isNumber(req.body.pageSize)){
            pager.code = ErrorCode.ParamError;
            pager.message = "分页页码必须为数字";
            return res.json(pager);
        }else {
            let obj = {
                pageIndex: req.body.pageIndex,
                pageSize: req.body.pageSize,
                times: utils.getNowTime()
            };
            if (req.body.cid == "" || req.body.cid == "null" || isNaN(req.body.cid)) {
                obj.cid = null;
            } else {
                obj.cid = req.body.cid;
            }
            if (req.body.type == "" || req.body.type == "null" || isNaN(req.body.type)) {
                obj.type = null;
            } else {
                obj.type = req.body.type;
            }
            let cbData = await getSql.indexItem(obj);
            let cbCount = await getSql.indexItemCount(obj);
            pager.total = cbCount.data.length ? cbCount.data[0].count : 0;
            pager.code = cbData.status;
            pager.data = cbData.data;
            return res.json(pager);
        }
    }

    /**
     * 获取礼品详情
     * **/
    async getItemDetails(req,res,next){
        let pager = {};
        if(utils.isNull(req.body.id) || utils.isNull(req.body.cid) || !utils.isNumber(req.body.id) || !utils.isNumber(req.body.cid)) {
            pager.code = ErrorCode.ParamError;
            pager.message = "参数错误";
            return res.json(pager);
        }
            let obj = {
                id : req.body.id,
                cid : req.body.cid,
                times : utils.getNowTime()
            };
            let cbData = await getSql.itemDetails(obj);
            if(cbData.data.length) {
                let userId = await getRedis.getUserSession(req.headers.token);
                let ids = userId == null ? null : JSON.parse(userId).id;
                let getUserPoint = await getSql.getUserPoint(ids);
                pager.code = cbData.status;
                pager.data = cbData.data;
                if (getUserPoint.status == 200) {
                    pager.data[0].userPoint = getUserPoint.data[0].point;
                } else {
                    pager.data[0].userPoint = 0;
                }
                return res.json(pager);
            }else{
                pager.code = ErrorCode.NotFound;
                pager.message = "找不到这个页面";
                return res.json(pager);
            }
    }
    /**
     * 获取首页任务列表
     * **/
    async getTask(req,res,next){
        let pager = {};
        let userSession = await getSession.getUserSession(req.headers.token);
        let userId = userSession == null ? null : userSession.id;
        if(utils.isNull(req.body.pageIndex) || utils.isNull(req.body.pageSize) || !utils.isNumber(req.body.pageIndex) || !utils.isNumber(req.body.pageSize)){
            pager.code = ErrorCode.ParamError;
            pager.message = "分页页码必须为数字";
            return res.json(pager);
        }
        let obj = {
            pageIndex : req.body.pageIndex,
            pageSize : req.body.pageSize,
            uptime : utils.getNowTime(),
            userid : userId
        };
        obj.sort = req.body.sort ? req.body.sort : 0;
        let userToken = await getRedis.getUserSession(req.headers.token);
        let userid = userToken == null ? null : JSON.parse(userToken).id;
        let getUserAge = await getSql.indexUserAge(userid);
        console.log(getUserAge);
        obj.age  = getUserAge.data.length ? getUserAge.data[0].age : 0;
        obj.sex  = getUserAge.data.length ? getUserAge.data[0].sex : 0;
        switch (parseInt(obj.sex)) {
            case 0 :
                obj.sex = 1;
                break;
            case 1 :
                obj.sex = 2;
                break;
        }
        obj.ages = 0;
        if(0 < obj.age  && obj.age <= 15){
            obj.ages = 1;
        }else if(15 < obj.age && obj.age<= 30){
            obj.ages = 2;
        }else if(30 < obj.age && obj.age<= 45){
            obj.ages = 3;
        }else if(45 < obj.age && obj.age<= 60){
            obj.ages = 4;
        }else if (obj.age > 60){
            obj.ages = 5;
        }
        console.log(obj.ages);
        let cbData = await getSql.indexTask(obj);
        let cbCount = await getSql.indexTaskCount(obj);
        pager.total = cbCount.data.length  ? cbCount.data[0].count : 0;
        pager.code = cbData.status;
        pager.data = cbData.data;
        return res.json(pager);
    }
    /**
     * 获取礼品分类
     * **/
    async pCategory(req,res,next){
        let pager ={};
        let cbData = await getSql.getCategory();
        pager.code = cbData.status;
        pager.data = cbData.data;
        return res.json(pager);
    }
    /**
     * 上传图片
     * **/
    async uploadImg(req,res,next){
        try {
            const upload = muilter.single(req.query.value);
            upload(req, res, function (err) {
                if (err) {
                    if (err.code == "LIMIT_FILE_SIZE") {
                        res.json({
                            status: 404,
                            message: "图片大小不能超过5M"
                        });
                    } else {
                        res.json({
                            status: 404,
                            message: "只能上传JPG,PNG,JPEG,GIF等格式图片"
                        });
                    }
                } else {
                    res.json({
                        code: 200,
                        message: "上传成功",
                        url: config.admin_address + "/upload/img/",
                        newdata: req.file
                    });
                }
            })
        }catch(e){
            next(e);
        }
    }
}
module.exports =new oAuth();