const createError = require('http-errors');
const express = require('express');
// var favicon = require('serve-favicon');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
//connect-redis is a Redis session store backed by node_redis, and is insanely fast :). Requires redis >= 2.0.0 for the SETEX command.
const redis = require("connect-redis");//redis三方库
const loggerMorgan = require('morgan');//处理日志模块
const http = require('http');
const indexRouter = require('./routes/index');//引入index相关路由请求
const config = require("./config");//获取配置信息对象
const log4js = require("./lib/log");
const logger = log4js.logger("app");//打印log日志文件
const ErrorCode = require("./lib/ErrorCode");
// const scheduleList = require("./lib/schedule");
//var users = require('./routes/users');
//var admins = require('./routes/adminRouter');
//var cors = require("cors");
const app = express();
// view engine setup
//跑批次
// scheduleList.onehours();
// scheduleList.clearUserSign();
const RedisStore=redis(session);
const redisStores=new RedisStore({
    host:config.redis_host,
    port:config.redis_port,
    db:config.redis_session_db,
    prefix:'Fengge'
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine("html",require("ejs").renderFile);//渲染html模板
app.set('view engine', 'html');
app.use(loggerMorgan('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit:'50mb'}));//解析请求体中的json格式
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
app.use(cookieParser());
app.use(session({
        secret: 'fenggewudi',
        cookie:{maxAge: 1000*60*60*24},
        resave:true,
        store:redisStores,
        saveUninitialized: true
    })
);
process.on('message',function(code){
    console.log(code);
});
app.use("*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://192.168.1.4:8080');
    // res.header('Access-Control-Allow-Origin', 'http://www.enjoybuy88.com');
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With,token");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    // res.header("Access-Control-Max-Age",3600);
    if (req.method === 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next()
    }
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log("进来");
  next(createError(404));
});

//记录错误日志
app.use(function (err, req, res, next) {
    let status = err.status || 500;
    logger.error('【error】', 'status:', status, 'message:', err.message || '');
    logger.error('【stack】\n ', err.stack || '');
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  //   res.json({
  //       code: ErrorCode.SystemError,
  //       msg: err.message
  //   });
  res.render('error');
});
module.exports = app;
