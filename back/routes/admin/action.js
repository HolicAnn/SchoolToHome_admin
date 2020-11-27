//学校活动
//创建班级
//上传课表
const router = require('koa-router')()
const Action = require("../../db/Action");
const User = require("../../db/User");
const getUserInfo = require("../../util/getUserInfo");
const moment = require('moment');
const uuid = require('uuid');
// router.prefix('/user')
const {
    jstSecret
} = require('../../util/secret.js')

//新建活动
router.post("/create", async (ctx, next) => {
    let {
        name,
        cover,
        memo,
    } = ctx.request.body;
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {

            let j = await Action.findOne({
                name
            }).then((doc) => {
                return doc;
            })
            if (j) {
                return ctx.body = {
                    state: 201,
                    data: j,
                    msg: "该活动名称已经存在，请勿切换名称"
                }
            }
            let action = await new Action({
                name,
                cover,
                memo,
                created_time: moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'),
            });
            let data = await action.save().then((doc) => {
                return doc;
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    msg: "活动创建成功",
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

//活动列表
router.get("/list", async ctx => {//
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {
            let list = await Action.find({}).sort({
                created_time: -1
            })
                .then((doc) => {
                    return doc;
                })
            return (ctx.body = {
                state: 200,
                msg: "获取活动列表成功",
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

//活动详情
router.get("/detail", async ctx => {
    let {
        name
    } = ctx.request.query;

    let data = await Action.findOne({
        name
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
            msg: "错误，该活动不存在",
        }
    }
});

module.exports = router