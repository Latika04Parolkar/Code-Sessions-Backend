const mongoose = require("mongoose");

const codingSchema = new mongoose.Schema({
    testId : String,
    question : String,
    constraints : String,
    sampleTestCases : [{
        input : String,
        output : String
    }],
    hiddenTestCases : [{
        input : String,
        output : String
    }],
});

const Coding = mongoose.model("coding", codingSchema);

module.exports = Coding