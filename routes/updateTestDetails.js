const express = require("express");
const router = new express.Router();
const TestDetails = require("../models/testDetails");
const Aptitude = require("../models/aptitude");
const Coding = require("../models/coding");

const userCheck = require("../controller/userCheck");

const app = express();
app.use(router);

// req.body ? => hogya
// only if testDate > date.now()

router.post("/updateTestDetails", userCheck, async (req, res) => {
    try {
        if (
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher'
        ) {
            if (
                req.body.testId &&
                req.body.action
            ) {
                const testId = req.body.testId;
                const testDate = req.body.testDate;
                const action = req.body.action;
                const testDuration = parseInt(req.body.testDuration) * 60 * 60 * 1000;
                const test = await TestDetails.findOne({ testId }, "testDate").lean();
                const d = (new Date(test.testDate)).getTime();
                if (d > Date.now()) {
                    if (action === 'update') {
                        await TestDetails.updateOne({ testId }, {
                            testDate,
                            testDuration
                        })
                    }
                } else throw new Error("Please enter correct date!")
                if (action === 'delete') {
                    await TestDetails.findOneAndDelete({ testId });
                    await Aptitude.deleteMany({ testId });
                    await Coding.deleteMany({ testId });
                }
                res.status(200).send({
                    code: 200,
                    status: "Success",
                    message: "Action has been done on Test Details!",
                    testId
                })
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

// add in req.body => action (update or delete)
router.post("/updateAptituteQuestions", userCheck, async (req, res) => {
    try {
        if (
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher'
        ) {
            if (
                req.body.testId &&
                req.body.aptitudeID &&
                req.body.action
            ) {
                const { testId, aptitudeID, action, question, options, answer } = req.body;
                const test = await TestDetails.findOne({ testId }, "testDate").lean();
                const d = (new Date(test.testDate)).getTime();
                if (d > Date.now()) {
                    if (action === 'update' && (
                        req.body.question ||
                        req.body.options ||
                        req.body.answer
                    )) {
                        await Aptitude.findByIdAndUpdate({ _id: aptitudeID }, {
                            question,
                            options,
                            answer
                        })
                        res.status(200).send({
                            code: 200,
                            status: "Success",
                            message: "Action done on Aptitude Question Successfully!",
                            testId,
                            aptitudeID
                        })
                    } else if (action === 'delete') {
                        await Aptitude.findByIdAndDelete({ _id: aptitudeID });
                        await TestDetails.updateOne({ testId }, {
                            $pull: {
                                aptitude: aptitudeID
                            }
                        })
                    } else throw new Error("Date expired!")

                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Action done on Aptitude Question Successfully!",
                        testId,
                        aptitudeID
                    })
                } else throw new Error("Invalid action!")
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

router.post("/updateCodingProblems", userCheck, async (req, res) => {
    try {
        if (
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher'
        ) {
            if (
                req.body.testId &&
                req.body.codingID &&
                req.body.action
            ) {
                const { testId, codingID, question, action, constraints, sampleTestCases, hiddenTestCases } = req.body;
                const test = await TestDetails.findOne({ testId }, "testDate");
                const d = (new Date(test.testDate)).getTime();
                if (d > Date.now()) {
                    if (action === 'update' && (
                        req.body.question ||
                        req.body.constraints ||
                        req.body.sampleTestCases ||
                        req.body.hiddenTestCases
                    )) {
                        await Coding.findByIdAndUpdate({ _id: codingID }, {
                            question,
                            constraints,
                            sampleTestCases,
                            hiddenTestCases
                        })
                    } else if (action === 'delete') {
                        await Coding.findByIdAndDelete({ _id: codingID });
                        await TestDetails.updateOne({ testId }, {
                            $pull: {
                                coding: codingID
                            }
                        })
                    }
                } else throw new Error("Date expired!")
                res.status(200).send({
                    code: 200,
                    status: "Success",
                    message: "Action done on Coding Problem Successfully!",
                    testId,
                    codingID
                })
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