'use strict';


const MongoClient = require('mongodb').MongoClient;

function __connectDB(dbName,callback){
  const url = 'mongodb://127.0.0.1:27017';
  MongoClient.connect(url, function(err, client) {
    const db = client.db(dbName);
    callback(err,db,client);
  });
}

// 初始化,并建立索引, 每个项目都需要修改
init('microblog','user');
function init(dbName,collectionName,){
  __connectDB(dbName,(err,db,client)=>{
    db.collection(collectionName).createIndex(
      { username : 1 },   //索引字段
      { unique:true },    //索引唯一不能重复
      function(err, result) {
         if(err){
           console.log(err);
           return;
         }
        console.log('索引建立成功');         
    });
  })
}

// 插入数据
exports.insertOne = (dbName,collectionName,data,callback)=>{
  __connectDB(dbName,(err,db,client)=>{
    db.collection(collectionName).insertOne(data, function(err, r) {
      callback(err,r);
      client.close();
    });
  })
}

// 查询
exports.find = function(dbName,collectionName,json,C,D){
  if(arguments.length == 4){
    var callback = C;
    var count = 0;
    var page = 0;
    var sort ={};
  }else if(arguments.length == 5){
    var callback = D;
    var count = C.count || 0;
    var page = C.page || 0;
    var sort = C.sort || {};
  }else{
    throw new Error('参数数量不正确');
  }
  // {"count":"每页多少数量","page":"第几页","sort":{排序规则}}
  let skipCount = count*(page-1);
  __connectDB(dbName,(err,db,client)=>{
    db.collection(collectionName).find(json).skip(skipCount).limit(count).sort(sort).toArray((err,doc)=>{
      callback(err,doc);
      client.close();
    });
  })
}

// 删除
exports.delMany = (dbName,collectionName,json,callback)=>{
  __connectDB(dbName,(err,db,client)=>{
    db.collection(collectionName).deleteMany(json,(err,r)=>{
      callback(err,r);
      client.close();
    })
  })
}

// 修改
exports.modify = (dbName,collectionName,json1,json2,callback)=>{
  __connectDB(dbName,(err,db,client)=>{
    db.collection(collectionName).updateOne(json1,json2,(err,r)=>{
      callback(err,r);
      client.close();
    })
  })
}


// 获取总数
exports.getCount = (dbName,collectionName,json,callback)=>{
  __connectDB(dbName,(err,db,client)=>{
    db.collection(collectionName).count(json,(err,r)=>{
      callback(err,r);
      client.close();
    });
  })
}