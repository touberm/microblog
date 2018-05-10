'use strict';

const formidable = require('formidable');
const http = require('http');
const util = require('util');
const db = require('../models/db');
const md5 = require('../models/md5');
const fs = require('fs');
const gm = require('gm');
const path = require('path');





exports.showIndex = (req, res, next) => {
  let username, login,avatar;
  // 判断是否登录
  if(req.session.login == '1'){
    username = req.session.username;
    login = true;
  }else{
    username = null;
    login = false;
  }
  // 查询头像信息
  db.find('microblog', 'user', {
    "username": req.session.username
  }, (err, r) => {
    if(r.length == 0){
      avatar = './avatar/default.png';
    }else{
      avatar = r[0].avatar;
    }
    res.render('index', {
      "login": login,
      "username": username,
      "active": "index",
      "avatar": avatar
    });
  })
 


}
// 注册页面
exports.showRegist = (req, res, next) => {
  res.render('regist', {
    "login": req.session.login == '1' ? true : false,
    "username": req.session.username,
    "active": "regist"
  });
}
// 注册
exports.doRegist = (req, res, next) => {
  var form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    let username = fields.username;
    let password = fields.password;
    // 简单md5加密
    let md5Psw = md5(md5(password).substr(4, 7) + md5(password));

    db.find('microblog', 'user', {
      "username": username
    }, (err, r) => {
      if (r.length == 0) {
        db.insertOne('microblog', 'user', {
          "username": username,
          "password": md5Psw,
          "avatar": "./avatar/default.png"
        }, (err, r) => {
          if (err) {
            res.send("-2"); //注册失败
          }
          req.session.login = '1';
          req.session.username = username;

          res.send("1"); //注册成功
        })
      } else {
        res.send('-1'); //用户已存在
      }
    })
  });
}

// 登录页面
exports.showLogin = (req, res, next) => {
  res.render('login', {
    "login": req.session.login == '1' ? true : false,
    "username": req.session.username,
    "active": "login"
  });
}
// post登录
exports.doLogin = (req, res, next) => {
  var form = new formidable.IncomingForm();

  form.parse(req, function (err, fields, files) {
    let username = fields.username;
    let password = fields.password;
    // 简单md5加密
    let md5Psw = md5(md5(password).substr(4, 7) + md5(password));
    db.find('microblog', 'user', {
      "username": username
    }, (err, r) => {
      if (r.length == 0) {
        // 用户名不存在
        res.send('2');
      } else {
        if (md5Psw == r[0].password) {
          // 登录成功
          req.session.login = '1';
          req.session.username = username;
          res.send('1');
        } else {
          //密码错误
          res.send('-1');
        }
      }
    })
  });
}

// 登出
exports.doLogout = (req, res, next) => {
  req.session.destroy(() => {
    // 登出成功
    res.send('1');
  });

}

// 上传头像SHOW
exports.showUploadAvatar = (req, res, next) => {
  if (req.session.login != '1') {
    res.send('非法闯入,经返回登录!');
  } else {
    res.render('uploadAvatar', {
      "login": true,
      "username": req.session.username,
      "active": "setting",
      "avatar": req.session.avatar
    });
  }

}

// 上传头像DO
exports.doUploadAvatar = (req, res, next) => {
  let form = new formidable.IncomingForm();

  form.uploadDir = "./avatar/";

  // 查询是否有按用户名创建的目录 如果没有则创建
  fs.readdir(path.join('./avatar', req.session.username.toString()), (err, files) => {
    if (err) {
      fs.mkdir('./avatar/' + req.session.username, (err) => {
        doUpload(req,res);
      });
    } else {
      doUpload(req,res);
    }
  })

  // 上传函数
  function doUpload(req,res) {
    form.parse(req, function (err, fields, files) {
      // 头像文件改名
      let oldpath = files.avatar.path;
      let newFileName = 'avatar'+path.extname(files.avatar.name);
      let newpath = path.join("./avatar/" , req.session.username, newFileName);
      // 修改数据库中avatar
      db.modify('microblog','user',{"username":req.session.username},{$set:{"avatar":newpath}},(err,r)=>{
        if(err){
          console.log(err);
        }
      })
      fs.rename(oldpath, newpath, (err) => {
        if (!err) {
          req.session.avatar = newpath;
          res.redirect("/cutAvatar");
        } else {
          console.log(err);
          res.send('failed');
        }
      })


    });
  }
}

// 剪切头像 SHOW
exports.showCutAvatar = (req,res)=>{
  if(req.session.login != `1`){
    res.send('非法闯入,请进行登录!');
    return;
  }
  res.render('cutAvatar',{
    "avatar":req.session.avatar
  })
}

// 剪切头像 DO
exports.doCutAvatar = (req,res)=>{

  let form = new formidable.IncomingForm();
  
  form.parse(req, function (err, fields, files) {
    let w = fields.w;
    let h = fields.h;
    let l = fields.l;
    let t = fields.t;
    let name = req.session.avatar;
    gm(name).crop(w,h,l,t).resize(100,100,"!").write(name,(err)=>{
      if(err){
        res.send('-1')
      }else{
        res.send('1');
      }
    })

  });
}

// 发送信息
exports.doSendMes = (req,res)=>{
  let form = new formidable.IncomingForm();
  
  form.parse(req, function (err, fields, files) {
    let username = req.session.username;
    let message = fields.message;
    let time = new Date();
    db.insertOne('microblog','message',{"username":username,"message":message,"time":time},(err,r)=>{
      if(err){
        res.send('-1');
      }else{
        res.send('1');
      }
    })
  });
}

// 获取所有博客
exports.getAllBlog = (req,res)=>{
  // 判断是否登陆
  if(req.session.login != '1'){
    res.send('-1');
    return;
  }

  let page = req.query.page;
  let count = 10;
  db.find('microblog','message',{},{"count":count,"page":page,"sort":{"time":-1}},(err,r)=>{
    if(err){
      console.log(err);
      res.send('-2'); //获取失败
    }else{
      res.send(r);
    }
  })
}

// 获取用户信息
exports.getUserInfo = (req,res)=>{
  // 判断是否登陆
  if(req.session.login != '1'){
    res.send('-1');
    return;
  }
  let username = req.query.username;
  db.find('microblog','user',{"username":username},(err,r)=>{
    if(err){
      console.log(err);
      res.send('-2'); //获取失败
    }else{
      res.send(r);
    }
  })
}

// 获取消息总数
exports.getAmount = (req,res)=>{
  // 判断是否登陆
  if(req.session.login != '1'){
    res.send('-1');
    return;
  }
  db.getCount('microblog','message',{},(err,r)=>{
    if(err){
      console.log(err);
      res.send('-2');
      return;
    }

    res.send(r.toString());

  })
}

// 个人主页
exports.showPersonal = (req,res)=>{
  let personalName = req.params.username;
  //读取个人信息 也可以在页面上用ajax获取
  db.find('microblog','user',{"username":personalName},(err,r)=>{
    if(err){
      res.send('-4');//登录个人主页失败
      return;
    }
    //读取该用户所有消息
    db.find('microblog','message',{"username":personalName},{"sort":{"time":-1}},(err,personalBlog)=>{
      if(err){
        res.send('-5');//读取消息失败
      }

      res.render('homepage',{
        "login": req.session.login == "1" ? true : false,
        "username": req.session.username,
        "active" : "-1",                      //header.ejs状态 ,如无则为-1
        "avatar": r[0].avatar,
        "personalName" : personalName,
        "personalBlog" : personalBlog

      })
    })
  })
}

// 成员列表
exports.showMemberList = (req,res)=>{
  db.find('microblog','user',{},(err,memberList)=>{
    if(err){
      res.send('-5');//获取成员类表失败
      return;
    }

    res.render('memberList',{
      "login": req.session.login == "1" ? true : false,
      "username": req.session.username,
      "active" : "memberList",                      //header.ejs状态 ,如无则为-1
      "avatar": req.session.avatar,
      "memberList" : memberList
    })

  })
}

exports.showAllBlog = (req,res)=>{
   // 判断是否登陆
  if(req.session.login != '1'){
    res.send('-1');
    return;
  }
  
  // res.send('hi');
  
  res.render('allBlog',{
    "login":  true,
    "username": req.session.username,
    "active" : "allBlog",                      //header.ejs状态 ,如无则为-1
    "avatar": req.session.avatar
  });
    
}