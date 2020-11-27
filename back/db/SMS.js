const mongoose = require("mongoose");

//定义数据库骨架（字段名，字段类型，是否默认值）
var schema = mongoose.Schema({
    phonenumbers: { //发送号码
        type: String
    },
    signnames: { // 签名名称
        type: String,
    },
    templates: { //模板code
        type: String,
    },
    created_time: { //发送时间
        type: String,
    },
    codes: { //验证码
        type: Number,
    }
}, {
    versionKey: false //版本号不更新

});
module.exports = mongoose.model("SMS", schema, "SMS");