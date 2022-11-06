const express = require('express');
const teacherSignup = require("./routes/teacherSignup");
const studentLogin = require("./routes/studentLogin");
const addTestDetails = require("./routes/addTestDetails");
const displayTestDetails = require("./routes/displayTestDetails");
const updateTestDetails = require("./routes/updateTestDetails");
const fetchTestIds = require("./routes/fetchTestIds");
const submission = require("./routes/submission");

require('../app/connection/db');
const app = express();
app.use(express.json());

app.use(teacherSignup);
app.use(studentLogin);
app.use(addTestDetails);
app.use(displayTestDetails);
app.use(updateTestDetails);
app.use(fetchTestIds);
app.use(submission);

app.listen(5000, () => console.log('listening on : 5000'));

// C:\Program Files\MongoDB\Server\5.0\bin
// Svvv2023@superuser