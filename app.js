const express = require("express")
const ejs = require("ejs");
const bodyPreser = require("body-parser");
const md5 = require("md5");
const multiparty = require("multiparty");

const mongoDb = require("./modules/mongoDB");



const app = express();

//设置模板引擎
app.set("view engine","ejs");
//设置模板路径
app.set("views",__dirname+"/content");
//设置静态资源
app.use(express.static("resources"));

//图片上传目录
app.use("/upload",express.static("upload"));

//bodyPerser设置
app.use(bodyPreser.urlencoded({extended:false}));
app.use(bodyPreser.json());



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
        if(req.session.userInfo && req.session.userInfo.username!=""){
            app.locals["userInfo"] = req.session.userInfo;
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

    var username = req.body.username;
    var password = md5(req.body.password);

    mongoDb.find("users",{
        username:username,
        password:password
    },function(err,data){
        if(err){
            console.log(err)
            return;
        }
        if(data.length>0){
            console.log("登录成功"); //
            req.session.userInfo = data[0];
            res.redirect("/productList");
        }else{
            console.log("登录失败");
            res.send("<script>alert('用户名或密码错误');location.href='/login';</script>")
        }
    });
});

//商品列表
app.get("/productList",(req,res)=>{

    mongoDb.find("product",{},(err,data)=>{
        if(err){
            console.log(err);
        }else{
            res.render("main/productList",{
                list:data
            });
        }
    })
});

//商品添加
app.get("/productAdd",(req,res)=>{
    res.render("main/productAdd")
});
app.post("/doProductAdd",(req,res)=>{
    var form = new multiparty.Form();
    form.uploadDir = "upload";   /*前提目录必须存在*/
    form.parse(req, function(err, fields, files) {
        console.log(fields);
        var title = fields.title[0];
        var jg = fields.jg[0];
        var yf = fields.yf[0];
        console.log(files);
        var pic = files.pic[0].path;


        mongoDb.save("product",{
            title,jg,yf,pic
        },function(err,data){
            if(err){
                console.log(err);
                return ;
            }else{
                res.redirect("/productList")
            }
        })
    });
})

//商品编辑
app.get("/productEdit",(req,res)=>{
    res.send("列表编辑")
});

//商品删除
app.get("/productDel",(req,res)=>{
    res.send("列表页面")
});

//注销session
app.get("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
        }else{
            res.redirect("/login");
        }
    });
})


app.listen("8080");