const mongoose = require("mongoose");

//定义数据库骨架（字段名，字段类型，是否默认值）
var schema = mongoose.Schema({
    username: { //phone
        type: String,
    },
    nickname: {//昵称
        type: String,
    },
    password: {//密码
        type: String,
    },
    created_time: {//创建时间
        type: String,
    },
    filepath: { //头像地址
        type: String,
    },
    role: {
        type: Number,//管理员:1     学生:0      教师:-1     家长:-2
        default: 0,
    },
    classes: {
        type: String,
    },
    memo: {//签名
        type: String,
    },
    classesId: {
        type: String,
    }

}, {
    versionKey: false //版本号不更新

});
module.exports = mongoose.model("User", schema, "User");