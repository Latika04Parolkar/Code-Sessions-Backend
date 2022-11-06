const express = require("express");
const router = new express.Router();
const TestDetails = require("../models/testDetails");
const userCheck = require("../controller/userCheck")

const app = express();
app.use(router);

router.get("/fetchTestIds", async (req, res) => {
    try {
        const testDetails = await TestDetails.find({}, "testId -_id").sort({ testDate: -1 });
        res.status(200).send({
            code: 200,
            status: "Success",
            message: "Test IDs Fetched!",
            testDetails
        })
    } catch (error) {
        console.log("error", error);
        res.status(400).send({
            code: 400,
            status: "Failed",
            message: error.message,
        });
    }
})

router.post("/getTestQuestions", async (req, res) => {
    try {
       // if (req.userData.role === 'student') {
            if (req.body.testId) {
                const testId = req.body.testId;
                const check = await TestDetails.exists({ testId });
                if (check) {
                    const test = await TestDetails.findOne({ testId }, "-_id testId aptitude coding");
                    res.send({
                        code: 200,
                        status: "Success",
                        message: "Test IDs Fetched!",
                        test
                    })
                }else throw new Error("Enter correct test id!")
            } else throw new Error("enter required details")
       // } else throw new Error("Unauthorised User")
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