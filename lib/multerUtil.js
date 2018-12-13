const multer = require('multer');
const config = require("../config");
//限制上传等
//设置上传属性
const storage = multer.diskStorage({
    //设置上传后文件路径
    destination: function (req, file, cb) {
        //图片存放地址
        cb(null, config.imgPath)
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        let fileFormat = (file.originalname).split(".");
        //file.fielaname = "上传的id";
        cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});
//添加配置文件到muler对象。
const upload = multer({
    storage: storage,
    limits: {fileSize: 5*1024*1024},
    fileFilter: function (req, file, cb) {
        let mimetypes = (['image/*']).join(",");
        let testItems = file.mimetype.split('/');
        if ((new RegExp('\\b' + testItems[0] + '/\\*', 'i')).test(mimetypes) || (new RegExp('\\*/' + testItems[1] + '\\b', 'i')).test(mimetypes) || (new RegExp('\\b' + testItems[0] + '/' + testItems[1] + '\\b', 'i')).test(mimetypes)) {
            cb(null, true);
        } else {
            return cb(new Error(), false);
        }
    }
});
module.exports = upload;