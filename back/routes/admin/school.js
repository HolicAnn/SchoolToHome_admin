//学校介绍
const router = require('koa-router')()
const School = require("../../db/School");

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

module.exports = router