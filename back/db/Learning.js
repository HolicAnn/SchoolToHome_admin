const mongoose = require("mongoose");

//定义数据库骨架（字段名，字段类型，是否默认值）
var schema = mongoose.Schema({
    name: {
        type: String,
    },
    title: {
        type: String,
    },
    created_time: {//创建时间
        type: String,
    },
    cover: {//封面地址
        type: String,
    },
    video: {//视频地址
        type: String,
    },
    QR: {//二维码
        type: String,
    },

}, {
    versionKey: false //版本号不更新

});
module.exports = mongoose.model("Learning", schema, "Learning");