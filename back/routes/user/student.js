const router = require('koa-router')()
const User = require("../../db/User");
const Classes = require("../../db/Classes");
const School = require("../../db/School");
const Learning = require("../../db/Learning");
const Action = require("../../db/Action");
const Health = require("../../db/Health");
const moment = require("moment");
const getUserInfo = require("../../util/getUserInfo");
const {
    jstSecret
} = require('../../util/secret.js')

/*
1.学生主界面：查看课表，接受班级通知，提交作业，学校介绍，学校新闻，健康申报，考勤打卡，请假申请，联系老师（返回老师的手机号），青年大学习
2.校园活动：参加校园活动，活动签到申请
3.我的：显示个人信息，登录，我的学时，我的活动，设置{背景音乐，头像，昵称，签名，背景}
*/

//获取班级列表
//  /user/student/class_list
router.get("/class_list", async ctx => {//
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let list = await Classes.find({}).sort({
        created_time: -1
    }).then((doc) => {
        return doc;
    })
    return (ctx.body = {
        state: 200,
        msg: "获取班级列表成功",
        list: list,
    });
});

//绑定班级
//  /user/student/bind_class?classesId&data_id
router.get("/bind_class", async ctx => {
    let {
        classesId,
        data_id
    } = ctx.request.query;

    let result;
    if (data_id) {
        result = await User.findById({
            _id: data_id
        }).then((doc) => {
            return doc;
        });
    }

    console.log(ctx);
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let user = await getUserInfo(ctx, jstSecret, "reader");

    let _id = "";
    if (result) {
        _id = data_id;
    }
    if (user) {
        _id = user._id;
    }

    if (user || result) {
        let user = await User.findOne({
            _id: _id
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 0) {
            let data = await User.findOneAndUpdate({
                _id: _id
            }, {
                classesId
            }, {
                upsert: true
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    msg: "绑定班级成功！"
                });
            } else {
                return (ctx.body = {
                    state: 201,
                    msg: "绑定班级失败！"
                });
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "请登录学生账号!",
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "请登录后重试！",
        });
    }
});

//查看课表
// /user/student/get_timetable
router.get("/get_timetable", async ctx => {
    let {
        data_id
    } = ctx.request.query;

    let result;
    if (data_id) {
        result = await User.findById({
            _id: data_id
        }).then((doc) => {
            return doc;
        });
    }

    console.log(ctx);
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let creator = await getUserInfo(ctx, jstSecret, "reader");

    let _id = "";
    if (result) {
        _id = data_id;
    }
    if (creator) {
        _id = creator._id;
    }

    if (creator || result) {

        let user = await User.findOne({
            _id: _id
        }).then((doc) => {
            return doc;
        })
        if (user.password == result.password && user.role == 0) {
            let data = await Classes.findById({
                _id: result.classesId
            }).then((doc) => {
                return doc;
            })
            if (data) {
                return ctx.body = {
                    state: 200,
                    data: data.timetable,
                    msg: "查询课表成功"
                }
            } else {
                return ctx.body = {
                    state: 201,
                    msg: "未查询到此学生账号"
                }
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "请登录学生账号!",
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "请登录后重试！",
        });
    }
});

//学校介绍
router.get("/school_memo", async ctx => {
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
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

//联系老师
// /user/student/get_teacher_phone
router.get("/get_teacher_phone", async ctx => {
    //console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    //let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    let {
        data_id
    } = ctx.request.query;

    let result;
    if (data_id) {
        result = await User.findById({
            _id: data_id
        }).then((doc) => {
            return doc;
        });
    }

    console.log(ctx);
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let creator = await getUserInfo(ctx, jstSecret, "reader");

    let _id = "";
    if (result) {
        _id = data_id;
    }
    if (creator) {
        _id = creator._id;
    }


    if (result || creator) {
        let user = await User.findOne({
            _id: _id
        }).then((doc) => {
            return doc;
        })
        if (user.password == result.password && user.role == 0) {
            let data = await Classes.findById({
                _id: result.classesId
            }).then((doc) => {
                return doc;
            })
            if (data) {
                return ctx.body = {
                    state: 200,
                    data: data.teacher_username,
                    msg: "查询老师联系电话成功"
                }
            } else {
                return ctx.body = {
                    state: 201,
                    msg: "未查询到此学生账号"
                }
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "请登录学生账号!",
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "请登录后重试！",
        });
    }
});

//青年大学习
router.get("/learning_list", async ctx => {//
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
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
});

//青年大学习详情
router.get("/learning_detail", async ctx => {
    let {
        id
    } = ctx.request.query;
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
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

//校园活动
// /user/student/action_list
router.get("/action_list", async ctx => {//
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let list = await Action.find({}).sort({
        hot: -1
    }).then((doc) => {
        return doc;
    })
    return (ctx.body = {
        state: 200,
        msg: "获取列表成功",
        list: list,
    });
});

//活动详情
router.get("/action_detail", async ctx => {
    let {
        id
    } = ctx.request.query;
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let data = await Action.findOne({
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
            msg: "错误，该活动不存在",
        }
    }
});

//健康申报
router.get("/declaration", async ctx => {
    let {
        temperature,
        is_cough,
        data_id
    } = ctx.request.query;

    let result;
    if (data_id) {
        result = await User.findById({
            _id: data_id
        }).then((doc) => {
            return doc;
        });
    }

    console.log(ctx);
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let creator = await getUserInfo(ctx, jstSecret, "reader");

    let _id = "";
    if (result) {
        _id = data_id;
    }
    if (creator) {
        _id = creator._id;
    }

    if (creator || result) {
        let user = await User.findOne({
            _id: _id
        }).then((doc) => {
            return doc;
        })
        if (user.password == result.password && result.role == 0) {
            let classes = await Classes.findById({
                _id: result.classesId
            }).then(doc => {
                return doc;
            });
            let professional = classes.faculty + classes.professional + classes.name;

            let health = await new Health({
                name: result.nickname,
                created_time: moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'),
                userid: result.id,
                temperature,
                is_cough,
                professional: professional,
            });
            let data = await health.save().then((doc) => {
                return doc;
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    msg: "健康申报成功",
                    data: data,
                });
            } else {
                return (ctx.body = {
                    state: 201,
                    msg: "申报失败",
                });
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "请登录学生账号!",
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "请登录后重试！",
        });
    }
});

//健康申报记录
router.get("/declaration_list", async ctx => {
    let {
        data_id
    } = ctx.request.query;

    let result;
    if (data_id) {
        result = await User.findById({
            _id: data_id
        }).then((doc) => {
            return doc;
        });
    }

    console.log(ctx);
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let creator = await getUserInfo(ctx, jstSecret, "reader");

    let _id = "";
    if (result) {
        _id = data_id;
    }
    if (creator) {
        _id = creator._id;
    }

    if (creator || result) {
        let user = await User.findOne({
            _id: result.id
        }).then((doc) => {
            return doc;
        })
        if (user.password == result.password && user.role == 0) {
            let data = await Health.find({
                userid: result.id
            }).then((doc) => {
                return doc;
            })
            return ctx.body = {
                state: 200,
                data: data,
                msg: "查询健康申报记录成功"
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "请登录学生账号!",
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