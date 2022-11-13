const express = require("express");
const router = new express.Router();
const axios = require("axios");
const TestDetails = require("../models/testDetails");
const TestHistory = require("../models/testHistory");
const Aptitude = require("../models/aptitude");
const Coding = require("../models/coding");
const Submission = require("../models/submissionDB");

const userCheck = require("../controller/userCheck");

const app = express();
app.use(router);

router.post("/calculateAptitudeScore", userCheck, async (req, res) => {
    try {
        if (req.userData.role === "student") {
            if (
                req.body.testId &&
                req.body.studentId &&
                req.body.aptitudeQuestionId &&
                req.body.studentAnswer
            ) {
                const { testId, studentId, aptitudeQuestionId, studentAnswer } = req.body;
                const aptitudeAnswer = await Aptitude.findById({ _id: aptitudeQuestionId }, " -_id answer");
                let answer;
                if (studentAnswer == aptitudeAnswer.answer) {
                    answer = true;
                } else {
                    answer = false;
                }
                const check = await Submission.exists({ testId, studentId });
                if (check) {
                    const currentQuestionState = await Submission.findOne({ testId, studentId }, "aptitudeScore");
                    const questionInd = currentQuestionState.aptitudeScore.findIndex(ques => ques.questionId === aptitudeQuestionId);
                    if (questionInd > -1) {
                        currentQuestionState.aptitudeScore[questionInd].answer = answer;
                    } else {
                        currentQuestionState.aptitudeScore.push({
                            questionId: aptitudeQuestionId,
                            answer
                        })
                    }
                    await currentQuestionState.save();
                } else {
                    const firstAttempt = new Submission({
                        testId,
                        studentId,
                        aptitudeScore: [{
                            questionId: aptitudeQuestionId,
                            answer
                        }],
                    })
                    await firstAttempt.save();
                }
                res.status(200).send({
                    code: 200,
                    status: "Success",
                    message: "Showing result",
                    result: answer
                })
            } else throw new Error("please send all the required information!")
        } else throw new Error("check user role!")
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})
// https://compiler-backend.onrender.com
router.post("/checkHiddenTestCases", userCheck, async (req, res) => {
    try {
        if (req.userData.role === "student") {
            if (req.body.testId &&
                req.body.questionId &&
                req.body.code &&
                req.body.language &&
                req.body.studentId
            ) {
                const { testId, questionId, code, language, studentId } = req.body;
                const { hiddenTestCases } = await Coding.findById({ _id: questionId }, "hiddenTestCases");
                let testCasesPassed = 0;
                let answer = false;
                for (const hiddenTestCase of hiddenTestCases) {
                    const input = hiddenTestCase.input;
                    const { data: { jobId } } = await axios.post("http://localhost:4000/run", {
                        language,
                        code,
                        input
                    })
                    console.log(jobId);
                    let output;
                    let intervalId;
                    console.log(output);
                    const asyncInterval = async () => {
                        return new Promise((resolve, reject) => {
                            intervalId = setInterval(async () => {
                                const { data: dataRes } = await axios.get(
                                    "http://localhost:4000/status",
                                    { params: { id: jobId } }
                                );
                                const { success, job, error } = dataRes;
                                if (success) {
                                    const { status: jobStatus, output: jobOutput } = job;
                                    outputJob = job;
                                    if (jobStatus === "pending") return;
                                    // output = jobOutput;
                                    resolve(jobOutput)
                                    clearInterval(intervalId);
                                } else {
                                    reject(`Error: Please retry! : ${error}`);
                                    clearInterval(intervalId);
                                }
                            }, 1000)
                        })
                    }
                    output = await asyncInterval();
                    console.log(output);
                    if (output.trim() == hiddenTestCase.output) {
                        testCasesPassed += 1;
                    }
                    console.log(output);
                }
                if(testCasesPassed === hiddenTestCases.length){
                   answer = true;
                }
                const check = await Submission.exists({ testId, studentId });
                if (check) {
                    const currentTestState = await Submission.findOne({ testId, studentId }, "codingResult");
                    const questionInd = currentTestState.codingResult.findIndex(prob => prob.questionId === questionId);
                    if (questionInd > -1) {
                        currentTestState.codingResult[questionInd].testCasesPassed = testCasesPassed;
                        currentTestState.codingResult[questionInd].answer = answer;
                    } else {
                        currentTestState.codingResult.push({
                            questionId,
                            testCasesPassed,
                            answer
                        })
                    }
                    await currentTestState.save();
                } else {
                    const firstAttempt = new Submission({
                        testId,
                        studentId,
                        codingResult: [{
                            questionId,
                            testCasesPassed,
                            answer
                        }],
                    })
                    await firstAttempt.save();
                }
                res.status(200).send({
                    code: 200,
                    status: "Success",
                    message: "Showing Coding result",
                    testCasesPassed
                })
            } else throw new Error("Send all information!");
        } else throw new Error("Unauthorised User!");
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/showCurrentTestResult", userCheck, async (req, res) => {
    try {
        if (req.userData.role === "student") {
            if (
                req.body.studentId &&
                req.body.testId
            ) {
                const { studentId, testId } = req.body;
                const studentResult = await Submission.findOne( {testId , studentId} , "-_id aptitudeScore codingResult");
                const test = await TestDetails.findOne( { testId }, "-_id aptitude coding");
                const  aptitudeMarks = studentResult.aptitudeScore.filter(obj => obj.answer === true).length;
                const codingResult = studentResult.codingResult.filter(obj => obj.answer === true).length;
                const check = await TestHistory.exists( {testId} );
                if(check){
                    const testHistory = await TestHistory.findOne({studentId});
                    testHistory.tests.push({
                        testId,
                        totalAptitude : test.aptitude.length,
                        aptitudeMarks : aptitudeMarks,
                        totalCoding : test.coding.length,
                        codingResult : codingResult
                    })
                } else {
                    const testHistory = new TestHistory({
                        studentId,
                        tests : [
                            {
                            testId,
                            totalAptitude : test.aptitude.length,
                            aptitudeMarks : aptitudeMarks,
                            totalCoding : test.coding.length,
                            codingResult : codingResult
                            }
                        ]
                    })
                    await testHistory.save();
                }
                res.status(200).send({
                    code: 200,
                    status: "success",
                    message: "Showing current test result",
                    totalAptitude : test.aptitude.length,
                    aptitudeMarks,
                    totalCoding : test.coding.length,
                    codingResult
                })
            } else throw new Error("Give full information!")
        } else throw new Error("check role!")
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/testAttemptedStatus", userCheck, async (req,res) => {
    try{
        if(req.userData.role === "student"){
            if(
                req.body.testId &&
                req.body.studentId
            ){
                const { testId , studentId } = req.body;
                const check = await Submission.exists( { testId , studentId });
                let isAttempted;
                if(check){
                    isAttempted = true;
                } else{
                    isAttempted = false;
                }
                res.status(200).send({
                    code: 200,
                    status: "success",
                    message: "Showing current test result",
                    isAttempted
                })
            } else throw new Error("Send all required data")
        } else throw new Error("Unauthorised user")
    } catch(error){
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/testHistory", userCheck, async (req, res) => {
    try {
        if (req.userData.role === "student") {
            if (req.body.studentId) {
                const studentId = req.body.studentId;
                const testHistory = await TestHistory.find({ studentId }, "-_id -__v");
                res.status(200).send({
                    code: 200,
                    status: "success",
                    message: "Showing current test result",
                    testHistory
                })
            } else throw new Error("Enter student id");
        } else throw new Error("User unauthorised");
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.get("/allStudentTestHistory", userCheck, async (req, res) => {
    try {
        if (req.userData.role === "superUser" || req.userData.role === "teacher") {
            const testHistory = await TestHistory.find();
            res.status(200).send({
                code: 200,
                status: "success",
                message: "Showing current test result",
                testHistory
            })
        } else throw new Error("User unauthorised")
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