const express = require("express")
const ejs = require("ejs");
const bodyPreser = require("body-parser");


const app = express();

//设置模板引擎
app.set("view engine","ejs");
//设置模板路径
app.set("views",__dirname+"/content");
//设置静态资源
app.use(express.static("resources"));
//bodyPerser设置
app.use(bodyPreser.urlencoded({extended:false}));
app.use(bodyPreser.json());

//mongodb链接数据库
var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://127.0.0.1:27017/dxh";

//保存session
const session = require("express-session");
//配置中间件
app.use(session({
    secret: 'chenglv',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:1000*60*30  //30分钟
    }
    ,rolling:true
}));

//中间件session过滤
app.use((req,res,next)=>{
    let _url_ = req.url;
    if(_url_=="/" || _url_=="/login" || _url_=="/doLogin"){
        next();
    }else{
        if(session.userInfo && session.userInfo.username!=""){
            next();
        }else{
            res.redirect("/login");
        }
    }
})

//首页
app.get("/",(req,res)=>{
   // res.send("shouyee")
    res.redirect("/login");
})

//登录页面
app.get("/login",(req,res)=>{
    res.render("auth/login")
});
//登陆操作
app.post("/doLogin",(req,res)=>{

    MongoClient.connect(mongoUrl, (err, client)=>{
        if(err){
            console.log("数据库链接失败");
            return false;
        }
        let usersDb = client.db("dxh").collection("users");
        let cursor = usersDb.find({"username":req.body.username,"password":req.body.password});
        cursor.toArray((err,data)=>{
            if(data.length>0){
                console.log("登录成功"); //
                session.userInfo = data[0];
                res.redirect("/productList");
            }else{
                console.log("登录失败");
                res.send("<script>alert('用户名或密码错误');location.href='/login';</script>")
            }
            client.close();
        });
    });
});

//商品列表
app.get("/productList",(req,res)=>{
    res.render("main/productList")
});

//商品添加
app.get("/productAdd",(req,res)=>{
    res.render("main/productAdd")
});

//商品编辑
app.get("/productEdit",(req,res)=>{
    res.send("列表编辑")
});

//商品删除
app.get("/productDel",(req,res)=>{
    res.send("列表页面")
});


app.listen("8080");