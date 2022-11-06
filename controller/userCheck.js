const jwt = require("jsonwebtoken");
// const env = require("dotenv");
// env.config();

const userCheck = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, "thisissoconfusing");
    req.userData = payload;
    next();
  } catch (error) {
    res.status(401).send({ code: 401, message: "Unauthorized!" });
  }
};

module.exports = userCheck;