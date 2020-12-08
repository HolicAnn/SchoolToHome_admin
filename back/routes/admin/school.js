//学校介绍
const router = require('koa-router')()
const School = require("../../db/School");
const News = require("../../db/News");
const User = require("../../db/User");
const Work = require("../../db/Work");
const moment = require("moment");
const getUserInfo = require("../../util/getUserInfo");
const {
    jstSecret
} = require('../../util/secret.js')

//学校简介
router.get("/detail", async ctx => {
    let data = await School.find({
        state: 2020
    }).then((doc) => {
        return doc;
    })
    return ctx.body = {
        state: 200,
        data: data,
        msg: "查询成功"
    }
});

router.post("/addnews", async (ctx, next) => {
    let {
        msg,
        title
    } = ctx.request.body;
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {

            let news = await new News({
                msg,
                title,
                created_time: moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'),
            });
            let data = await news.save().then((doc) => {
                return doc;
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    msg: "新建通知",
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

router.post("/addwork", async (ctx, next) => {
    let {
        title,
        commit_time,
        memo,
        classes
    } = ctx.request.body;
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {

            let work = await new Work({
                title,
                commit_time,
                memo,
                classes,
                created_time: moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'),
            });
            let data = await work.save().then((doc) => {
                return doc;
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    msg: "发布作业成功",
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

module.exports = router