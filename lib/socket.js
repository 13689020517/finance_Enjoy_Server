const getRedis = require("./getRedis");
module.exports = function (io,client) {
    //推送兑换礼品列表
    client.on("itemlist",function() {
        let db = getRedis.getExchangeItem("itemlist");
        console.log(db);
        io.sockets.emit("itemlist",db);
    });
    //断开连接
    client.on('disconnect', function () {
        console.log("退出");
    });
}

