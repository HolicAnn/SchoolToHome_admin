const mongoose = require("mongoose");

//定义数据库骨架（字段名，字段类型，是否默认值）
var schema = mongoose.Schema({
    created_time: {
        type: String,
    },
    title: {
        type: String,
    },
    commit_time:{//提交时间
        type:String,
    },
    memo:{//备注
        type:String,
    },
    classes:{
        type:String,
    }

}, {
    versionKey: false //版本号不更新
});
module.exports = mongoose.model("Work", schema, "Work");