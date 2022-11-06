const mongoose = require("mongoose");

const testDetailsSchema = new mongoose.Schema({
    testId : String,
    aptitude : [mongoose.SchemaTypes.ObjectId],
    coding : [mongoose.SchemaTypes.ObjectId],
    testDate : Date,
    testDuration : Number
}, {
    timestamps : true
});

const TestDetails = mongoose.model("testDetails", testDetailsSchema);

module.exports = TestDetails