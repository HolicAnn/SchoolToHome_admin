//青年大学习
const router = require('koa-router')();
const Learning = require("../../db/Learning");
const User = require("../../db/User");
const getUserInfo = require("../../util/getUserInfo");
const moment = require('moment');
// router.prefix('/user')
const {
    jstSecret
} = require('../../util/secret.js');

//新建青年大学习
router.post("/create", async (ctx, next) => {
    let {
        name,
        cover,
        video,
        QR
    } = ctx.request.body;
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {

            let j = await Learning.findOne({
                name,
                cover,
                video,
                QR
            }).then((doc) => {
                return doc;
            })
            if (j) {
                return ctx.body = {
                    state: 201,
                    data: j,
                    msg: "该青年大学习已经存在，请勿重复创建"
                }
            }
            let classes = await new Learning({
                name,
                cover,
                video,
                QR,
                created_time: moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'),
            });
            let data = await classes.save().then((doc) => {
                return doc;
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    msg: "新建青年大学习成功",
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

//青年大学习列表
router.get("/list", async ctx => {//
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {
            let list = await Learning.find({}).sort({
                created_time: -1
            })
                .then((doc) => {
                    return doc;
                })
            return (ctx.body = {
                state: 200,
                msg: "获取列表成功",
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

//青年大学习详情
router.get("/detail", async ctx => {
    let {
        id
    } = ctx.request.query;

    let data = await Learning.findOne({
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
            msg: "错误，该数据不存在",
        }
    }
});

module.exports = router