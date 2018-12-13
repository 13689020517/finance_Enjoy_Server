const config = require("../config");
const request = require("request");
const wxLogin = {
        requests(url){
            let p = new Promise(function(resolve,reject){
                request.get({url},function(error,response,body){
                    if(error){
                        console.log("获取微信授权失败");
                        console.log(error);
                        let err = {
                            status : 400,
                            message : "获取微信授权失败",
                            data : []
                        };
                        resolve(err);
                        reject(error);
                    }
                    if(response.statusCode === 200){
                        let data = {
                            data : JSON.parse(body),
                            status : 200,
                            message : "成功"
                        };
                        resolve(data);
                    }else{
                        let err = {
                            status : 400,
                            message : "获取微信授权失败",
                            data : []
                        };
                        resolve(err);
                        reject(err)
                    }
                })
            });
            return p;
        }
};
module.exports = wxLogin;


// login : function(req,res,next){
//     // 这是编码后的地址
//     var return_uri = encodeURIComponent(config.enjoyPath + config.approute);
//     var scope = 'snsapi_userinfo';
//     res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid='+config.appid+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect')
//
// },
// getWx : function(req,res,next){
//     var code = req.query.code;
//     req.session.code = req.query.code;
//     request.get(
//         {
//             url:'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + config.appid + '&secret=' + config.appsecret+'&code=' + code + '&grant_type=authorization_code',
//         },
//         function(error, response, body){
//             if(response.statusCode === 200){
//
//                 // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
//                 // console.log(JSON.parse(body))
//
//                 let data = JSON.parse(body);
//                 let access_token = data.access_token;
//                 let openid = data.openid;
//                 req.session.userInfo = data;
//                 //req.session.openid = openid;
//                 request.get(
//                     {
//                         url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN',
//                     },
//                     function(error, response, body){
//                         if(response.statusCode == 200){
//
//                             // 第四步：根据获取的用户信息进行对应操作
//                             let userinfo = JSON.parse(body);
//
//                             getMysql.postMember(openid,function(cbdata){
//
//                                 if(cbdata.length) {
//                                     //微信登陆的话，是用appid
//                                     var user = {
//                                         userId : cbdata[0].id,
//                                         username : cbdata[0].user_name
//                                     };
//
//                                     req.session.user = user;
//                                     res.redirect(customType.path + "/index");
//                                     //res.json({
//                                     //		status : 200,
//                                     //		url: customType.path + "/index"
//                                     //	});
//                                 }else{
//                                     userinfo.openid = openid;
//                                     getMysql.postAddMember(userinfo,function(newsv){
//
//                                         var user = {
//                                             userId : newsv.insertId,
//                                             username : userinfo.nickname
//                                         }
//                                         req.session.user = user;
//                                         res.redirect(customType.path + "/index");
//                                         //res.json({
//                                         //		status :200,
//                                         //		url :customType.path + "/index"
//                                         //	});
//
//                                     });
//                                 }
//                             });
//
//                         }else{
//                             console.log(response.statusCode)
//                         }
//                     }
//                 )
//             }else{
//                 console.log(response.statusCode)
//             }
//         })
// },