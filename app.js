/*
 * @Author: touber 
 * @Date: 2018-05-09 14:34:27 
 * @Last Modified by: touber
 * @Last Modified time: 2018-05-10 17:17:36
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
app.get('/',router.showIndex);                          //首页
app.get('/regist',router.showRegist);                   //注册页面
app.post('/doRegist',router.doRegist);                  //执行注册
app.get('/login',router.showLogin);                     //登录页面 
app.post('/doLogin',router.doLogin);                    //执行登录
app.get('/logout',router.doLogout);                     //登出
app.get('/uploadAvatar',router.showUploadAvatar);       //上传头像页面
app.post('/doUploadAvatar',router.doUploadAvatar);      //执行头像上传
app.get('/cutAvatar',router.showCutAvatar);             //头像裁剪页面
app.post('/doCutAvatar',router.doCutAvatar);            //执行裁剪
app.post('/doSendMes',router.doSendMes);                //发表
app.get('/allBlog',router.getAllBlog);                  //获取所有blog,每页10个
app.get('/userInfo',router.getUserInfo);                //获取用户信息
app.get('/amount',router.getAmount);                    //获取blog总数
app.get('/homepage/:username',router.showPersonal);     //个人主页
app.get('/memberList',router.showMemberList);           //成员列表
app.get('/showAllBlog',router.showAllBlog);              //与获取所有blog调取同一个接口


app.listen(3000,'0.0.0.0');
