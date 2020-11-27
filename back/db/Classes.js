const mongoose = require("mongoose");

//定义数据库骨架（字段名，字段类型，是否默认值）
var schema = mongoose.Schema({
    name: {//班级名
        type: String,
    },
    created_time: {//创建时间
        type: String,
    },
    faculty: {//院系名称
        type: String,
    },
    professional: {//专业名称
        type: String,
    },
    teacher_username: {//辅导员电话
        type: String,
    },
    timetable: {//课表链接
        type: String,
    }
}, {
    versionKey: false //版本号不更新

});
module.exports = mongoose.model("Classes", schema, "Classes");