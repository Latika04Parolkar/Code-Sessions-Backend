const express = require("express");
const passport = require("passport");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const router = new express.Router();

const Users = require("../models/user");
const userCheck = require("../controller/userCheck");

require('../controller/auth');
const app = express();

app.use(router);


const generateAuthToken = (email, role, id) => {
    //const _id = id.toString()
    const token = jwt.sign({ email, role, id }, "thisissoconfusing", {
        expiresIn: "3.5h",
    });
    return token;
};


// router.get('/auth/google',
//     passport.authenticate('google', { scope: ['email', 'profile'] })
// );

router.get('/google/callback',
    passport.authenticate('google', { scope: ['email', 'profile'] },
        { failureRedirect: '/auth/failure', session: false }), async (req, res) => {
            let isValid;
            const emailID = req.user.email;
            const fullName = req.user.displayName;
            const studentImage = req.user.picture;
            const domainCheck = emailID.split("@")[1];
            const role = 'student';

            if (domainCheck == "svvv.edu.in") {
                const nanoID = nanoid();
                const jwt = generateAuthToken(emailID, role, nanoID);
                isValid = true;
                const check = await Users.exists({ emailID });
                if (check) {
                    res.send({
                        code: 200,
                        isValid,
                        login: true,
                        jwt,
                        emailID,
                        role,
                        studentImage
                    })
                } else {
                    const users = new Users({
                        fullName,
                        emailID,
                        role,
                        studentImage
                    });
                    await users.save();
                    res.status(200).send({
                        code: 200,
                        isValid,
                        login: false,
                        jwt: null,
                        emailID,
                        fullName,
                        studentImage,
                        _id : users._id
                    });
                    // redirect to : add personal info
                }
            } else {
                isValid = false;
                res.status(200).send({
                    code: 200,
                    isValid,
                    login: false,
                    jwt: null,
                    emailID
                });
            }
        }
)

router.get('/auth/failure', (req, res) => {
    res.send('Something went wrong!')
});


router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.send('Goodbye!');
    });

})

router.post("/addPersonalInfo", async (req, res) => {
    try {
        if (req.body.email) {
            const emailID = req.body.email;
            const rollNo = req.body.rollNo;
            const batch = req.body.batch;
            const branch = req.body.branch;
            const contact = parseInt(req.body.contact);
            let isValid = false;
            const check = await Users.exists({ emailID });
            if (check) {
                isValid = true;
                const nanoID = nanoid();
                const jwt = generateAuthToken(emailID, 'student', nanoID);
                await Users.updateOne({ emailID }, {
                    enrollmentNo: rollNo,
                    contact,
                    batch,
                    branch,
                });
                res.status(200).send({
                    code: 200,
                    isValid,
                    login: true,
                    jwt,
                    emailID
                });
            } else throw new Error("User doesn't exixts!");
        } else throw new Error("Enter all required information")
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/showPersonalInfo", userCheck, async (req, res) => {
    try {
        if (req.userData.role === "student") {
            if (req.body.email) {
                const emailID = req.body.email;
                const check = await Users.findOne({ emailID }, "-__v -createdAt -updatedAt");
                if (check) {
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Showing student info",
                        check
                    });
                } else throw new Error("User doesn't exixts!");
            } else throw new Error("Enter email")
        } else throw new Error("check role")
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

module.exports = router;