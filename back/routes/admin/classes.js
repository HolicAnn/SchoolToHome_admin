//创建班级
//上传课表
const router = require('koa-router')()
const Classes = require("../../db/Classes");
const User = require("../../db/User");
const crypto = require("crypto");
const getUserInfo = require("../../util/getUserInfo");
const moment = require('moment');
const uuid = require('uuid');
// router.prefix('/user')
const {
    jstSecret
} = require('../../util/secret.js')

//新建班级
router.post("/addclass", async (ctx, next) => {
    let {
        name,
        faculty,
        professional,
        teacher_username
    } = ctx.request.body;
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {

            let j = await Classes.findOne({
                name,
                faculty,
                professional,
                teacher_username
            }).then((doc) => {
                return doc;
            })
            if (j) {
                return ctx.body = {
                    state: 201,
                    data: j,
                    msg: "该专业班级已经存在，请勿重复创建"
                }
            }
            let classes = await new Classes({
                name,
                faculty,
                professional,
                created_time: moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'),
                teacher_username
            });
            let data = await classes.save().then((doc) => {
                return doc;
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    msg: "新建专业班级成功",
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

//班级列表
router.get("/list", async ctx => {//
    let creator = await getUserInfo(ctx, jstSecret, "reader"); //获取token
    if (creator) {
        let user = await User.findOne({
            username: creator.username
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password && user.role == 1) {
            let list = await Classes.find({}).sort({
                created_time: -1
            })
                .then((doc) => {
                    return doc;
                })
            return (ctx.body = {
                state: 200,
                msg: "获取班级列表成功",
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

//班级详情
router.get("/detail", async ctx => {
    let {
        teacher_username
    } = ctx.request.query;

    let data = await Classes.findOne({
        teacher_username
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
            msg: "错误，班级不存在",
        }
    }
});

//上传课表
router.post("/upload", async (ctx, next) => {
    let {
        id,//班级id
        path //文件路径
    } = ctx.request.body;//.files.filepath;
    console.log(id)
    let creator = await getUserInfo(ctx, jstSecret, "reader");
    if (creator) {
        let user = await User.findOne({
            username: creator.username,
            _id: creator._id
        }).then((doc) => {
            return doc;
        })
        if (user.password == creator.password) {
            const qiniu_sdk = require('qiniu')
            const accessKey = 'hngh71R29yRS5QgFJYbm70Ssaao8gcF3jWv--npm';
            const secretKey = 'EOjFL82mNt51W19xtWlIFkgZRDFIR7_1-x4IFbo1';
            const bucket = 'hahaha123123'; // 要上传的空间
            const prefix = 'haha/'; // 文件前缀
            qiniu_sdk.conf.ACCESS_KEY = accessKey;
            qiniu_sdk.conf.SECRET_KEY = secretKey;
            const token = (bucket, key) => { // 生成上传文件的 token
                const policy = new qiniu_sdk.rs.PutPolicy({
                    isPrefixalScope: 1,
                    scope: bucket + ':' + key
                });
                return policy.uploadToken();
            }
            const config = new qiniu_sdk.conf.Config();
            let file_name = uuid.v4();
            let file_path = path;
            const upload_file = (file_name, file_path) => {
                const file_save_path = prefix + file_name; // 保存到七牛的地址
                const up_token = token(bucket, file_save_path); // 七牛上传的token
                const extra = new qiniu_sdk.form_up.PutExtra();
                const formUploader = new qiniu_sdk.form_up.FormUploader(config);
                formUploader.putFile(up_token, file_save_path, file_path, extra, (err, ret) => { // 上传文件
                    if (!err) {
                        let url_ = 'http://mini.sylvia.org.cn/' + ret.key;
                        console.log(url_); // 上传成功， 处理返回值
                    } else {
                        console.error(err); // 上传失败， 处理返回代码
                    }
                })
            }

            upload_file(file_name, file_path);
            let url = 'http://mini.sylvia.org.cn/' + prefix + file_name;

            let ji = await Classes.findByIdAndUpdate(id, {
                timetable: url
            }, {
                upsert: true
            });
            if (ji) {
                let data = await Classes.findById({
                    _id: id
                }).then((doc) => {
                    return doc;
                })
                if (data) {
                    return ctx.body = {
                        state: 200,
                        data: data,
                        msg: "图片上传成功",
                    }
                }
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "未登陆，请登陆后重试",
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