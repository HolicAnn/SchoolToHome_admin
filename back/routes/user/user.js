const router = require('koa-router')()
const SMS = require("../../db/SMS")
const sendSMS = require("../../util/sendSMS");
const moment = require('moment');
const User = require("../../db/User");
const crypto = require("crypto");
const uuid = require("uuid");
const jwt = require("jwt-simple");
const getUserInfo = require("../../util/getUserInfo");
const {
    jstSecret
} = require('../../util/secret.js')

//用户注册，短信
//post  http://ip:8888/user/user/register?phone=手机号&password=密码&code=验证码&nickname=昵称&codes=验证码（1:注册，2:重置）
router.get("/register", async (ctx, next) => {
    let {
        phone,//username
        password,
        nickname,
        codes,//验证码
    } = ctx.request.query;
    /*
    let phoneReg = /^1[3|4|5|7|8]\d{9}$/;
    if (!phoneReg.test(phone)) {
        return (ctx.body = {
            state: 201,
            msg: "手机号码格式不对"
        });
    }
    */
   console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let pwdReg = /^[0-9a-zA-Z]{8,}$/;
    if (!pwdReg.test(password)) {
        return (ctx.body = {
            state: 201,
            msg: "密码至少为8位"
        });
    }

    let ss = await User.findOne({
        username: phone
    }).then(doc => {
        return doc;
    });
    if (ss) {
        return (ctx.body = {
            state: 201,
            msg: "该账号已注册"
        });
    }
    let j = await SMS.find({
        phonenumbers: phone,
        templates: "SMS_180055577"
    })
        .sort({
            _id: -1
        })
        .limit(1)
        .then(doc => {
            return doc;
        });
    if (j && j.length == 1) {
        var d1 = new Date(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm:ss')).getTime()
        var d2 = new Date(j[0].created_time).getTime();
        if (parseInt(d1 - d2) <= 5 * 60 * 1000) {
            if (j[0].codes != codes) {
                return (ctx.body = {
                    state: 201,
                    data: j,
                    msg: "验证码错误"
                });
            }
            var md5 = crypto.createHash("md5");
            md5.update(password);
            var str = md5.digest("hex");
            var pwd = str.toUpperCase();
            let user = new User({
                username: phone,
                password: pwd,
                role: 0,
                created_time: moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'),
                nickname
            });

            let data = await user.save().then(doc => {
                return doc;
            });
            if (data) {
                return (ctx.body = {
                    state: 200,
                    data: data,
                    msg: "注册成功"
                });
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "验证码已过期"
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "未找到短信记录"
        });
    }
});

//发送短信
//post  http://ip:8888/user/user/sendSMS?phone=手机号&TemplateCode=类型（1:注册，2:重置）
router.get("/sendSMS", async (ctx, next) => {
    //注册  1  SMS_180055577
    //重置  2  SMS_180045543
    let {
        phone,//username
        TemplateCode
    } = ctx.request.query;
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let phoneReg = /^1[3|4|5|7|8]\d{9}$/;
    if (!phoneReg.test(phone)) {
        return (ctx.body = {
            state: 201,
            msg: "电话格式错误"
        });
    }
    if (TemplateCode == 1) {
        TemplateCode = "SMS_180055577";
    } else if (TemplateCode == 2) {
        TemplateCode = "SMS_180045543";
    }

    let j = await SMS.find({
        phonenumbers: phone,
        templates: TemplateCode
    })
        .sort({
            _id: -1
        })
        .limit(1)
        .then(doc => {
            return doc;
        });
    if (j[0] && j.length == 1) {
        var d1 = Date.now();
        var d2 = new Date(j[0].create_time).getTime();
        if (parseInt(d1 - d2) <= 2 * 60 * 1000) {
            return (ctx.body = {
                state: 201,
                msg: "验证码已发送，请勿重复操作"
            });
        }
    }

    let sms = new sendSMS(phone, TemplateCode);
    let result = await sms.go();
    if (result.status == "success") {
        console.log(result);
        let sms = new SMS({
            phonenumbers: result.phonenumbers,
            signnames: result.signnames,
            created_time: result.created_time,
            templates: result.templates,
            codes: result.codes
        });
        let data = await sms.save().then(doc => {
            return doc;
        });
        if (data) {
            return (ctx.body = {
                state: 200,
                msg: "短信已发送，有效期五分钟，请勿重复操作"
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "短信发送失败",
            data: result
        });
    }
});

//忘记密码
//post  http://ip:8888/user/user/resetpwd?phone=手机号&newpwd=新密码&codes=验证码（1:注册，2:重置）
router.get("/resetpwd", async (ctx, next) => {
    let {
        phone,
        newpwd,
        codes
    } = ctx.request.query;
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let phoneReg = /^1[3|4|5|7|8]\d{9}$/;
    if (!phoneReg.test(phone)) {
        return (ctx.body = {
            state: 201,
            msg: "手机号码格式不对"
        });
    }
    let pwdReg = /^[0-9a-zA-Z]{8,}$/;
    if (!pwdReg.test(newpwd)) {
        return (ctx.body = {
            state: 201,
            msg: "密码至少为8位"
        });
    }
    let ss = await User.findOne({
        username: phone
    }).then(doc => {
        return doc;
    });
    if (ss) {
        let j = await SMS.find({
            phonenumbers: phone,
            templates: "SMS_180045543"
        })
            .sort({
                _id: -1
            })
            .limit(1)
            .then(doc => {
                return doc;
            });
        if (j[0] && j.length == 1) {
            var d1 = new Date(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm:ss')).getTime()
            var d2 = new Date(j[0].created_time).getTime();
            if (parseInt(d1 - d2) <= 5 * 60 * 1000) {
                if (j[0].codes != codes) {
                    return (ctx.body = {
                        state: 201,
                        msg: "验证码错误"
                    });
                }
                var md5 = crypto.createHash("md5");
                md5.update(newpwd);
                var str = md5.digest("hex");
                var pwd = str.toUpperCase();
                let data = await User.findOneAndUpdate({
                    username: phone
                }, {
                    password: pwd
                }, {
                    upsert: true
                });
                if (data) {
                    return (ctx.body = {
                        state: 200,
                        msg: "重置密码成功！"
                    });
                } else {
                    return (ctx.body = {
                        state: 201,
                        msg: "重置密码失败！"
                    });
                }
            } else {
                return (ctx.body = {
                    state: 201,
                    msg: "验证码已过期"
                });
            }
        } else {
            return (ctx.body = {
                state: 201,
                msg: "未找到短信记录"
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "该账号未注册"
        });
    }
});

//用户修改密码
//post  http://ip:8888/user/user/changepasswd?id=用户_id&newpwd=新密码&password=密码
router.get("/changepasswd", async (ctx, next) => {
    let {
        id,
        password,
        newpwd
    } = ctx.request.query;
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let user = await getUserInfo(ctx, jstSecret, "reader");
    if (user._id != id) {
        return (ctx.body = {
            state: 201,
            msg: "无权限"
        });
    }
    //加密
    var md5 = crypto.createHash("md5");
    md5.update(password);
    var str = md5.digest("hex");
    var pwd = str.toUpperCase();

    let ji = await User.findById(id).then(doc => {
        return doc;
    });
    if (ji.password == pwd) {
        //加密
        var md = crypto.createHash("md5");
        md.update(newpwd);
        var strs = md.digest("hex");
        newpwd = strs.toUpperCase();

        await User.findByIdAndUpdate(id, {
            password: newpwd
        }, {
            upsert: true
        });
    } else {
        return (ctx.body = {
            state: 200,
            msg: "密码修改成功"
        });
    }
});

//用户登陆
//post  http://ip:8888/user/user/login?username=手机账号&password=密码
router.get("/login", async ctx => {
    let {
        username,
        password
    } = ctx.request.query;
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
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
            username: username,
            password: pwd,
            role: 0
        }).then((doc) => {
            return doc;
        });
        if (result) {
            ctx.cookies.set('reader', jwt.encode(result._id, jstSecret), {
                httpOnly: false
            });
            return ctx.body = {
                state: 200,
                data: result._id,
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

//用户详情
//get  http://ip:8888/user/user/detail
router.get("/detail", async ctx => {
    //console.log(ctx);
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let user = await getUserInfo(ctx, jstSecret, "reader");
    if (user) {
        let data = await User.findById({
            _id: user._id
        }).then((doc) => {
            return doc;
        })
        if (data) {
            return ctx.body = {
                state: 200,
                data: data,
                msg: "查询成功"
            }
        }
    } else {
        return ctx.body = {
            state: 201,
            msg: "未登陆，请登陆后查看"
        }
    }
});

//编辑资料（昵称，签名）
//post  http://ip:8888/user/user/edit?nickname=昵称&memo=签名
router.get("/edit", async ctx => {
    let {
        nickname,
        memo
    } = ctx.request.query;
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    let user = await getUserInfo(ctx, jstSecret, "reader");
    if (user._id) {
        let ji = await User.findByIdAndUpdate(user.id, {
            nickname: nickname,
            memo: memo
        }, {
            upsert: true
        });
        if (ji) {
            return (ctx.body = {
                state: 200,
                msg: "编辑成功",
                data: ji
            });
        }
    } else {
        return (ctx.body = {
            state: 201,
            msg: "权限错误，请切换用户"
        });
    }

});

//退出登陆
//post  http://ip:8888/user/user/logout
router.get("/logout", async (ctx, next) => {
    ctx.cookies.set("user_token", "", {
        maxAge: 0
    })
    return (ctx.body = {
        state: 200,
        msg: "退出成功"
    });
});

//上传头像
//post  http://ip:8888/user/user/upload?path=本地图片地址
router.get("/upload", async (ctx, next) => {
    let {
        path //文件路径
    } = ctx.request.query;//.files.filepath;
    console.log(moment(Number.parseInt(Date.now())).format('YYYY-MM-DD HH:mm'));
    //console.log(ctx.request.files.filepath)
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

            let ji = await User.findByIdAndUpdate(user.id, {
                filepath: url
            }, {
                upsert: true
            });
            if (ji) {

                let data = await User.findById({
                    _id: user._id
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

//关于我们
//get  http://ip:8888/user/user/about
router.get("/about", async ctx => {
    return (ctx.body = {
        state: 200,
        msg: "蒋新&蒋仁雨 Android大作业",
        filepath: "https://img.zcool.cn/community/016752575784a50000012e7e5b659a.jpg@1280w_1l_2o_100sh.jpg"
    });
});
module.exports = router