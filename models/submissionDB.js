const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    studentId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    testId : String,
    aptitudeScore : [{
        questionId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "aptitude",
        },
        answer : Boolean
    }],
    codingResult : [
        {
        questionId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "coding",
        },
        testCasesPassed : Number,
        answer : Boolean
        }
    ],
},
{
    timestamps : true
});

const Submission = mongoose.model("submission", submissionSchema);

module.exports = Submission