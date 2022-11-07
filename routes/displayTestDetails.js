const express = require("express");
const router = new express.Router();
const TestDetails = require("../models/testDetails");
const Aptitude = require("../models/aptitude");
const Coding = require("../models/coding");

const userCheck = require("../controller/userCheck");

const app = express();
app.use(router);

// date & time check req.body?
// 1st - count
router.post("/displayTestDetails", userCheck, async (req, res) => {
    try {
        if (
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher' ||
            req.userData.role === 'student'
        ) {
            if (
                req.body.testId
            ) {
                const testId = req.body.testId;
                const check = await TestDetails.exists({ testId });
                if (check) {
                    const testDetails = await TestDetails.findOne({ testId }, "-_id -createdAt -updatedAt -__v").lean();
                    testDetails.testDuration = (testDetails.testDuration) / (60*60*1000);
                    testDetails.aptitude = testDetails.aptitude.length;
                    testDetails.coding = testDetails.coding.length;
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Displaying Test Details!",
                        testDetails
                    })
                } else throw new Error("test doesn't exists")
            } else throw new Error("Please fill all required fields!")
        } else throw new Error("Unauthorised Access!");
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/displayAptitudeQuestions", userCheck, async (req, res) => {
    try {
        if (
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher' ||
            req.userData.role === 'student'
        ) {
            if (
                req.body.testId
            ) {
                const testId = req.body.testId;
                const role = req.userData.role;
                if (role === 'student') {
                    const aptitude = await Aptitude.find({ testId }, "-answer -__v");
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Aptitude Questions Displayed Successfully!",
                        aptitude
                    })
                } else {
                    const aptitude = await Aptitude.find({ testId }, "-__v");
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Aptitude Questions Displayed Successfully!",
                        aptitude
                    })
                }
            } else throw new Error("Please fill all required fields!")
        } else throw new Error("Unauthorised Access!");
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/displayCodingProblems", userCheck, async (req, res) => {
    try {
        if (
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher' ||
            req.userData.role === 'student'
        ) {
            if (
                req.body.testId
            ) {
                const testId = req.body.testId;
                const role = req.userData.role;
                if (role === 'student') {
                    const coding = await Coding.find({ testId }, "-hiddenTestCases -__v");
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Coding Questions Displayed Successfully!",
                        coding
                    })
                } else {
                    const coding = await Coding.find({ testId }, "-__v");
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Coding Questions Displayed Successfully!",
                        coding
                    })
                }
            } else throw new Error("Please fill all required fields!")
        } else throw new Error("Unauthorised Access!");
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