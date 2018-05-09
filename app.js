/*
 * @Author: touber 
 * @Date: 2018-05-09 14:34:27 
 * @Last Modified by: touber
 * @Last Modified time: 2018-05-09 14:35:37
 */
'use strict';

const express = require('express');
const app = express();
const router = require('./router');
const session = require('express-session');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
// 模板引擎
app.set('view engine','ejs');
// 静态页面
app.use(express.static('./public'));
// 静态头像
app.use('/avatar',express.static('./avatar'));


// 路由
app.get('/',router.showIndex);
app.get('/regist',router.showRegist);
app.post('/doRegist',router.doRegist);
app.get('/login',router.showLogin);
app.post('/doLogin',router.doLogin);
app.get('/logout',router.doLogout);
app.get('/uploadAvatar',router.showUploadAvatar);
app.post('/doUploadAvatar',router.doUploadAvatar);
app.get('/cutAvatar',router.showCutAvatar);
app.post('/doCutAvatar',router.doCutAvatar);
app.post('/doSendMes',router.doSendMes);                //发表
app.get('/allBlog',router.getAllBlog);                  //获取所有blog,每页9个
app.get('/userInfo',router.getUserInfo);                //获取用户信息
app.get('/amount',router.getAmount);                    //获取blog总数


app.listen(3000);
