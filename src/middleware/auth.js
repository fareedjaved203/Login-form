//here we verify the token, to authenticate the user

const jwt = require("jsonwebtoken");
const Register = require("../models/signup");

const auth = async (req, res, next) => {
  //next argument is mandatory in middlewares bcoz the function wont move ahead without it
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifyUser);

    const user = await Register.findOne({ _id: verifyUser._id });
    console.log(user);

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).send(error);
  }
};

module.exports = auth;
