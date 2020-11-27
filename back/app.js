const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
// const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const mongoose = require('mongoose')
const koaBody = require("koa-body")
const router = require('koa-router')()
const fs = require("fs")
const path = require("path")

// error handler
onerror(app)
// middlewares
// app.use(bodyparser({
//   enableTypes: ['json', 'form', 'text']
// }))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(require('koa-static')(__dirname + '/upload'))
app.use(require('koa-static')(__dirname + '/views')) // 
// app.use(require('koa-static')(__dirname + '/views/webapp'))
// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

var Auser = require("./routes/admin/user");
var Aschool = require("./routes/admin/school");
var Aclasses = require("./routes/admin/classes");
var Alearning = require("./routes/admin/learning");
var Action = require("./routes/admin/action");

var Uuser = require("./routes/user/user");
var Uparent = require("./routes/user/parent");
var Ustudent = require("./routes/user/student");
var Uteacher = require("./routes/user/teacher");

//注册路由  
router.use("/admin/user", Auser.routes(), Auser.allowedMethods())
router.use("/admin/school", Aschool.routes(), Aschool.allowedMethods())
router.use("/admin/classes", Aclasses.routes(), Aclasses.allowedMethods())
router.use("/admin/learning", Alearning.routes(), Alearning.allowedMethods())
router.use("/admin/action", Action.routes(), Action.allowedMethods())

router.use("/user/parent", Uparent.routes(), Uparent.allowedMethods())
router.use("/user/user", Uuser.routes(), Uuser.allowedMethods())
router.use("/user/teacher", Uteacher.routes(), Uteacher.allowedMethods())
router.use("/user/student", Ustudent.routes(), Ustudent.allowedMethods())

app.use(
    koaBody({
        formLimit: "100mb",
        jsonLimit: "100mb",
        textLimit: "100mb",
        multipart: true, // 支持文件上传
        //encoding: 'gzip',
        formidable: {
            uploadDir: path.join(__dirname, './upload/'), // 设置文件上传目录
            keepExtensions: true, // 保持文件的后缀
            maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
        },
    })
);
app.use(router.routes())
router.get("/admin", async ctx => {
    let html = fs.readFileSync(__dirname + "/views/admin/index.html", "utf-8")
    ctx.status = 200
    ctx.body = html;
});
router.get("/", async ctx => {
    let html = fs.readFileSync(__dirname + "/views/webapp/index.html", "utf-8")
    ctx.status = 200
    ctx.body = html;
});

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});
//mongoose
mongoose.connect(
    "mongodb://localhost/tearoyale",
    (err) => {
        if (err) {
            console.log("数据库连接出错");
            console.log(err);
        } else {
            console.log("数据库连接成功");
        }
    }
);

module.exports = app