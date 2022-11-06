const mongoose = require("mongoose");
// const env = require("dotenv");
// env.config();
// mongodb+srv://dbAdmin:c0KTePYALzjPTTPx@testingcluster.xpnad.mongodb.net/?retryWrites=true&w=majority || mongodb://localhost:27017/codeSessions
const DATABASE_URI = "mongodb+srv://dbAdmin:c0KTePYALzjPTTPx@testingcluster.xpnad.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Succesfully connected to mongodb database!");
})