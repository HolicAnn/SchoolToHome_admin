const router = require('koa-router')()
const User = require("../../db/User");
const crypto = require("crypto");
const jwt = require("jwt-simple");
const getUserInfo = require("../../util/getUserInfo");
const moment = require('moment');
// router.prefix('/user')
const {
    jstSecret
} = require('../../util/secret.js')

//管理员登陆 admin 123456
//post http://ip:3000/admin/user/login?username=账号&password=密码
router.post("/login", async ctx => {
    let {
        username,
        password
    } = ctx.request.body;

    if (!username) {
        return ctx.body = {
            state: 201,
            msg: "账号不能为空"
        }
    } else if (!password) {
        return ctx.body = {
            state: 201,
            msg: "密码不能为空"
        }
    } else {
        let hash = crypto.createHash("md5");
        hash.update(password);
        let str = hash.digest('hex');
        let pwd = str.toUpperCase();

        let result = await User.findOne({
            username,
            password: pwd,
            role: 1
        }).then((doc) => {
            return doc;
        });
        if (result) {
            ctx.cookies.set('reader', jwt.encode(result._id, jstSecret), {
                httpOnly: false
            });
            return ctx.body = {
                state: 200,
                msg: "登录成功"
            }
        } else {
            return ctx.body = {
                state: 201,
                msg: "登录失败"
            }
        }
    }
});

//新建辅导员
//post http://ip:3000/admin/user/adduser?username=账号&password=密码
router.post("/adduser", async (ctx, next) => {
    let {
        username,
        password,
        memo,
        //role,
        nickname,
    } = ctx.request.body;
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {

            let j = await User.findOne({
                username: username
            }).then((doc) => {
                return doc;
            })
            if (j) {
                return ctx.body = {
                    state: 201,
                    data: j,
                    msg: "该用户已经存在，请勿重复创建"
                }
            }
            let hash = crypto.createHash("md5");
            hash.update(password);
            let str = hash.digest('hex');
            let pwd = str.toUpperCase();
            let user = await new User({
                username,
                password: pwd,
                role: -1,
                created_time: moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'),
                memo,
                nickname
            });
            let data = await user.save().then((doc) => {
                return doc;
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    msg: "新建辅导员成功",
                    data: data,
                });
            } else {
                return (ctx.body = {
                    state: 201,
                    msg: "创建失败",
                });
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "权限错误,请登录管理员账号!",
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "请登录后重试！",
        });
    }
});

//用户列表
//get http://ip:3000/admin/user/list
router.get("/list", async ctx => {
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {
            let list = await User.find({}).sort({
                created_time: -1
            })
                .then((doc) => {
                    return doc;
                })
            return (ctx.body = {
                state: 200,
                msg: "获取用户列表成功",
                list: list,
            });
        } else {
            return (ctx.body = {
                state: 201,
                msg: "权限错误,请登录管理员账号!",
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "请登录后重试！",
        });
    }
});

//用户详情
//get http://ip:3000/admin/user/detail?id=用户id
router.get("/detail", async ctx => {
    let {
        id
    } = ctx.request.query;

    let data = await User.findById({
        _id: id
    }).then((doc) => {
        return doc;
    })
    if (data) {
        return ctx.body = {
            state: 200,
            data: data,
            msg: "查询成功"
        }
    } else {
        return ctx.body = {
            state: 201,
            msg: "错误，用户不存在",
        }
    }
});

router.get("/teacher_list", async ctx => {
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {
            let list = await User.find({
                role: -1
            }).sort({
                created_time: -1
            }).then((doc) => {
                return doc;
            })
            return (ctx.body = {
                state: 200,
                msg: "获取辅导员列表成功",
                list: list,
            });
        } else {
            return (ctx.body = {
                state: 201,
                msg: "权限错误,请登录管理员账号!",
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "请登录后重试！",
        });
    }
});

module.exports = router