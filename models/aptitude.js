const mongoose = require("mongoose");

const aptitudeSchema = new mongoose.Schema({
    testId : String,
    question : String,
    options : [String],
    answer : Number,
});

const Aptitude = mongoose.model("aptitude", aptitudeSchema);

module.exports = Aptitude