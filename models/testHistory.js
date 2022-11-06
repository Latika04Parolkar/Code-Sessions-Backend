const mongoose = require("mongoose");

const testHistorySchema = new mongoose.Schema({
    studentId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    tests : [
        {
        testId : String,
        totalAptitude : Number,
        aptitudeMarks : Number,
        totalCoding : Number,
        codingResult : Number
        }
    ]
});

const TestHistory = mongoose.model("testHistory", testHistorySchema);

module.exports = TestHistory