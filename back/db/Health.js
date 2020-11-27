const mongoose = require("mongoose");

//定义数据库骨架（字段名，字段类型，是否默认值）
var schema = mongoose.Schema({
    name: {//nickname
        type: String,
    },
    created_time: {//创建时间
        type: String,
    },
    userid: {//user_id
        type: String,
    },
    professional: {//院系
        type: String,
    },
    temperature: {//温度
        type: String,
    },
    is_cough: {//是否咳嗽
        type: Number,
    }
}, {
    versionKey: false //版本号不更新

});
module.exports = mongoose.model("Health", schema, "Health");