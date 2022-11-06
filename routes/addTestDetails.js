const express = require("express");
const router = new express.Router();
const { nanoid } = require("nanoid");
const TestDetails = require("../models/testDetails");
const Aptitude = require("../models/aptitude");
const Coding = require("../models/coding");

const userCheck = require("../controller/userCheck");

const app = express();
app.use(router);

router.post("/createTest", userCheck, async(req,res) => {
    try{
        if(
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher'
        ){
            if(
                req.body.testDate &&
                req.body.testDuration
            ){
                const testId = nanoid();
                const testDate = req.body.testDate;
                const testDuration = parseInt(req.body.testDuration) * 60 * 60 * 1000;
                let d1 = new Date(testDate);
                let d2 = Date.now();                
                if(d1.getTime() > d2){
                    const testDetails = new TestDetails({
                        testId,
                        testDate,
                        testDuration
                    })
                    await testDetails.save();
                    res.status(200).send({
                        code: 200,
                        status: "Success",
                        message: "Test Created!",
                        testId
                    })
                } else throw new Error("Enter correct test date!")
            } else throw new Error("Please fill all required fields!")
        } else throw new Error("Unauthorised Access!");
    } catch(error){
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/addAptitudeQuestions", userCheck, async(req,res) => {
    try{
        if(
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher'
        ){
            if(
                req.body.testId &&
                req.body.question &&
                req.body.options &&
                req.body.answer
            ){
                const { testId , question , options , answer } = req.body;
                const check = await TestDetails.exists({testId});
                if(check){
                    const test = await TestDetails.findOne({testId}, "testDate").lean();
                    const d = (new Date(test.testDate)).getTime();
                    if( d > Date.now() ){
                        // 0 based indexing
                        const aptitude = new Aptitude({
                            testId,
                            question,
                            options,
                            answer
                        })
                        const apti = await aptitude.save();
                        await TestDetails.updateOne( { testId } , {
                            $push : {
                                aptitude : apti._id
                            }
                        })
                        const testDetails = await TestDetails.findOne({ testId }, "aptitude coding");
                        res.status(200).send({
                            code: 200,
                            status: "Success",
                            message: "Aptitude Questions Added Successfully!",
                            testId,
                            aptitudeCount : testDetails.aptitude.length,
                            codingCount : testDetails.coding.length
                        })
                    } else throw new Error("test dates back")
                }else throw new Error("test doesn't exists")
            } else throw new Error("Please fill all required fields!")
        } else throw new Error("Unauthorised Access!");
    } catch(error){
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/addCodingProblems", userCheck, async(req,res) => {
    try{
        if(
            req.userData.role === 'superUser' ||
            req.userData.role === 'teacher'
        ){
            if(
                req.body.testId &&
                req.body.question &&
                req.body.constraints &&
                req.body.sampleTestCases &&
                req.body.hiddenTestCases
            ){
                const { testId , question , constraints , sampleTestCases , hiddenTestCases } = req.body;
                
                const coding = new Coding({
                    testId,
                    question,
                    constraints,
                    sampleTestCases,
                    hiddenTestCases
                })
                const code = await coding.save();

                await TestDetails.updateOne( { testId } , {
                    $push : {
                        coding : code._id
                    }
                })
                const testDetails = await TestDetails.findOne({ testId }, "aptitude coding");

                res.status(200).send({
                    code: 200,
                    status: "Success",
                    message: "Coding Questions Added Successfully!",
                    testId,
                    aptitudeCount : testDetails.aptitude.length,
                    codingCount : testDetails.coding.length
                })
            } else throw new Error("Please fill all required fields!")
        } else throw new Error("Unauthorised Access!");
    } catch(error){
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

module.exports = router;