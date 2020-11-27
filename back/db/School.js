const mongoose = require("mongoose");

//定义数据库骨架（字段名，字段类型，是否默认值）
var schema = mongoose.Schema({
    state: {
        type: Number
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    //简述
    desc: {
        type: String
    },
}, {
    versionKey: false //版本号不更新
});
module.exports = mongoose.model("School", schema, "School");