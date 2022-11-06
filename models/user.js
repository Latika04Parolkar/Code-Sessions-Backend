const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usersSchema = new mongoose.Schema({
    fullName : String,
    emailID : {
        type : String,
        unique : true
    },
    contact : {
        type : Number,
        unique : true
    },
    password : String,
    role : {
        type : String,
        enum : ['superUser', 'teacher', 'student'],
        default : 'student',
    },
    enrollmentNo : String,
    batch : String,
    branch : String,
    studentImage : String
},{
    timestamps : true
});

usersSchema.pre('save', function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password =  bcrypt.hashSync(user.password, 10)
    }

    next()
})

const User = mongoose.model("users", usersSchema);

module.exports = User