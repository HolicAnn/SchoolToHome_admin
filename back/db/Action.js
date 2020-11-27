const mongoose = require("mongoose");

//定义数据库骨架（字段名，字段类型，是否默认值）
var schema = mongoose.Schema({
    name: {//活动名称
        type: String,
    },
    created_time: {//上传时间
        type: String,
    },
    cover: {//活动首页
        type: String,
    },
    memo: {//活动介绍
        type: String,
    }
}, {
    versionKey: false //版本号不更新

});
module.exports = mongoose.model("Action", schema, "Action");