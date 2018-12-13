let express = require('express');
let router = express.Router();
let oAuth = require('../controllers/oauth');
let oInfo = require("../controllers/oInfo");
let activation_oAuth = require('../controllers/activation_oauth');

router.get("/",oAuth.index);

/**
 * token权限校验
 * */
router.post("/*",oAuth.Auth);


/**
 * 微信登陆
 * **/
router.post("/auth/login",oAuth.login);

/**
 * 获取微信签名
 * **/
router.post("/auth/signature",oAuth.pSignature);

/**
 * 提交用户信息接口
 * */
router.post("/auth/register",oAuth.register);

router.post("/username",oAuth.username);
router.post("/getusername",oAuth.getusername);
/**
 * 发送验证码
 * **/
router.post("/auth/sendMsg",oAuth.sendMsg);
/**
 * 查询用户信息接口
 * **/
router.post("/auth/userinfo",oAuth.getUserInfo);

/**
 * 查询我的任务
 * **/
router.post("/auth/searchMyTask",oAuth.searchMyTask);

/**
 * 查询我的积分
 * **/
router.post("/auth/searchMyIntegral",oAuth.searchMyIntegral);

/**
 * 查询我的礼品
 * **/
router.post("/auth/searchMyGift",oAuth.searchMyGift);




/**
 * 获取公众号首页banner
 * */
router.post("/info/getBanner",oInfo.getBanner);
/**
 * 获取首页礼品
 * **/
router.post("/info/getItem",oInfo.getItem);
/**
 * 获取新手教程列表
 * **/
router.post("/info/getTutorial",oInfo.pGetTutorial);
/**
 * 查询兑换礼品redis记录
 * **/
router.post("/info/exchangeItemList",oInfo.pEexchangeItemList);

/**
 * 查询礼品详情
 * **/
router.post("/info/getItemDetails",oInfo.getItemDetails);

/**
 * 获取首页任务
 * **/
router.post("/info/getTask",oInfo.getTask);

/**
 * 获取任务详情
 * **/
router.post("/auth/getTaskDetails",oAuth.getTaskDetails);
/**
 * 做任务
 * **/
router.post("/auth/doTask",oAuth.getDoTask);
/**
 * 查看之前的任务
 * **/
router.post("/auth/lookTask",oAuth.lookTask);
/**
 * 提交任务
 * **/
router.post("/auth/subTask",oAuth.getSubTask);

/**
 * 兑换礼品
 * **/
router.post("/auth/exchange",oAuth.getExChange);

/**
 * 获取礼品分类
 * **/
router.post("/info/category",oInfo.pCategory);

/**
 * 上传图片
 * **/
router.post("/info/uploadImg",oInfo.uploadImg);

/**
 * 用户签到
 * **/
router.post("/auth/getSign",oAuth.getSign);
/**
 * 查询已签到数
 * **/
router.post("/auth/postSign",oAuth.postSign);
/**
 * 获取评价任务
 * **/
router.post("/auth/pEvalTask",oAuth.pEvalTask);
/**
 * 获取评价任务数量
 * **/
router.post("/auth/pEvalTaskCount",oAuth.pEvalTaskCount);
/**
 *  接受评价任务
 * **/
router.post("/auth/acceptEvalTask",oAuth.pAcceptEvalTask);

/**
 * 提交评价任务
 * **/
router.post("/auth/subEvalTask",oAuth.pSubEvalTask);

/**
 * 分享返积分
 * **/
router.post("/auth/share",oAuth.pShare);

/**
 * 代理接口
 * ***/
router.post("/auth/agency",oAuth.pAgency);


/**
 * 查询我的推广码领取周期
 * **/
router.post("/auth/querydenominationTime",activation_oAuth.querydenominationTime);

/**
 * 激活推广码
 * **/
router.post("/auth/ExchangeCode",activation_oAuth.getExchangeCode);

/**
 * 兑换积分激活推广码
 * **/
router.post("/auth/getChangeCode",activation_oAuth.getChangeCode);


module.exports = router;


