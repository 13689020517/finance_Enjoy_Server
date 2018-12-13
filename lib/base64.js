const fs = require("fs");
const config = require("../config");
const tx_cos = require("cos-nodejs-sdk-v5");
const Util = require("./utils");
const cos = new tx_cos(
    {
        SecretId: config.secretId,
        SecretKey: config.secretKey,
    }
);

const writeFile = function(dataBuffer){
    let p = new Promise((resolve,reject)=>{
        let name = Date.now() + Util.randomNum(4) + ".jpg";
        let filePath = config.imgPath + name;
        fs.writeFile(filePath, dataBuffer, function(err,row) {
            if(err){
                console.log(err);
                let errs = {
                    status : 400,
                    message : "图片转换失败",
                    data : []
                };
                reject(errs);
            }else{

                var params = {
                    Bucket: config.bucket,
                    Region: config.region,
                    Key: filePath,
                    FilePath: "./" + filePath
                }
                cos.sliceUploadFile(params, function(errs, data) {
                    if(errs) {
                        // console.log(JSON.stringify(errs));
                        fs.unlinkSync(filePath);
                        let erres = {
                            status : 400,
                            message : "上传失败",
                            data : []
                        };
                        reject(erres);
                    } else {
                        fs.unlinkSync(filePath);
                        console.log(data);
                        let imageSrc = config.cdnUrl + data.Key;
                        let oks = {
                            status : 200,
                            message:'上传成功',
                            data:imageSrc
                        };
                        resolve(oks);
                    }
                });


                // let oks = {
                //     status : 200,
                //     message : "图片存储成功",
                //     data : name
                // };
                // resolve(oks);
            }
        });
    });
    return p;
}
module.exports = writeFile;