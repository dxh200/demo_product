var MongoClient = require('mongodb').MongoClient;
//var mongoUrl = "mongodb://127.0.0.1:27017/dxh";
var options = {
    db_user: "",
    db_pwd: "",
    db_host: "127.0.0.1",
    db_port: 27017,
    db_name: "dxh"
};
//var mongoUrl = "mongodb://" + options.db_user + ":" + options.db_pwd + "@" + options.db_host + ":" + options.db_port + "/" + options.db_name;
var mongoUrl = "mongodb://" + options.db_host + ":" + options.db_port + "/" + options.db_name;

function __connectDB__(callback){
    MongoClient.connect(mongoUrl,(err,db)=>{
        if(err){
            console.log(err);
            return ;
        }
        callback(db);
        db.close();
        console.log("关闭数据库链接")
    })
}
//find
exports.find = (tableName,option,callback)=>{
    __connectDB__((db)=>{
        let cursor = db.db(options.db_name).collection(tableName).find(option);
        cursor.toArray((err,data)=>{
            callback(err,data);
        })
    });
}

//insert
exports.save = (tableName,option,callback)=>{
    __connectDB__((db)=>{
        //判断是否多个数据[{},{}]
        if(Array.isArray(option)){
            db.db(options.db_name).collection(tableName).insertMany(option,function(err,data){
                callback(err,data);
            });
        }else{
            db.db(options.db_name).collection(tableName).insertOne(option,function(err,data){
                callback(err,data);
            });
        }
    });
}

//update
exports.update = (tableName,option1,option2,callback)=> {
    __connectDB__((db) => {
        db.db(options.db_name).collection(tableName).updateOne(option1, {$set:option2}, function (err, data) {
            callback(err, data);
        })
    });
}

//delete
exports.delete = (tableName,option,callback)=> {
    __connectDB__((db) => {
        db.db(options.db_name).collection(tableName).deleteOne(option,function (err, data) {
            callback(err, data);
        })
    });
}