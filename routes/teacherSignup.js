const express = require("express");
const router = new express.Router();
const validator = require("validator");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userCheck = require("../controller/userCheck");
const Users = require("../models/user");

const app = express();

app.use(router);

router.post("/addTeacher", userCheck, async (req, res) => {
    try {
        if (
            req.userData.role === 'superUser' &&
            req.body.fullName &&
            validator.isEmail(req.body.emailID) &&
            validator.isMobilePhone(req.body.contact.toString(), "en-IN") &&
            validator.isStrongPassword(req.body.password, {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
                returnScore: false,
            }) &&
            req.body.confirmPassword
        ) {
            const fullName = req.body.fullName;
            const emailID = req.body.emailID;
            const password = req.body.password;
            const confirmPassword = req.body.confirmPassword;
            const contact = req.body.contact;
            const enrollmentNo = nanoid();
            const check = await Users.exists({ emailID });
            if (check) {
                throw new Error("User already exists!");
            } else {
                const users = new Users({
                    fullName,
                    emailID,
                    password,
                    contact,
                    role: 'teacher',
                    enrollmentNo
                });
                if (password === confirmPassword) {
                    await users.save();
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Teacher Added",
                        id: users._id,
                        emailID
                    })
                } else throw new Error("Check Your Password!");
            }
        } else throw new Error("Enter all the required fields properly!");
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

const generateAuthToken = (email, role, id) => {
    //const _id = id.toString()
    const token = jwt.sign({ email, role, id }, "thisissoconfusing", {
        expiresIn: "3.5h",
    });
    return token;
};

router.post("/teacherLogin", async (req, res) => {
    try {
        if (
            req.body.emailID &&
            req.body.password
        ) {
            const emailID = req.body.emailID;
            const password = req.body.password;
            const check = await Users.exists({ emailID });
            if (check) {
                const user = await Users.findOne({ emailID }, "password role enrollmentNo" );
                const matchPwd = await bcrypt.compare(password, user.password);
                if (matchPwd) {
                    const token = generateAuthToken(emailID, user.role, user.enrollmentNo);
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Teacher Logged In",
                        id: user._id,
                        jwt : token,
                        emailID,
                        role : user.role
                    })
                } else throw new Error("Email OR Password does not match!")
            } else throw new Error("user does not exist!");

        }
    } catch (error) {
        console.log(error);
        res.status(400).send({
            code: 400,
            status: "fail",
            message: error.message,
        });
    }
})

module.exports = router;