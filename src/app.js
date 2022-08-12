require("dotenv").config(); //always place it at the top
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
require("./db/conn");
const Register = require("./models/signup");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

app.use(express.json()); //to understand the incoming json data (from postman)
app.use(express.urlencoded({ extended: false })); //to get the form value data
app.use(cookieParser()); //to use cookie-parser middleware to get cookie

const staticPath = path.join(__dirname, "../public"); //to get css and js files
const templatePath = path.join(__dirname, "../templates/views");
const partialPath = path.join(__dirname, "../templates/partials");

app.use(express.static(staticPath));
app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialPath);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secretpage", auth, (req, res) => {
  //auth (middleware) verifies the user with the help of cookies + jwt, and this page will only be displayed to him
  //when the token expires, this page won't be visible
  console.log(`cookie is: ${req.cookies.jwt}`); //to get the cookie value using cookie-parser, it will show undefined when cookie expires else it will show the token No.
  res.render("secretpage");
});

app.get("/logout", auth, async (req, res) => {
  //with auth, it will check if token/ cookie is available or not
  try {
    console.log("This is req.user= " + req.user); //the one who logs in

    //to logout from the current device only!

    req.user.tokens = req.user.tokens.filter((currentElement) => {
      return currentElement.token != req.token;
    });

    //In filter() method we are removing the current token from the database bcoz each time the same user logs in, a token is stored in the database, so when he logs out, that needs to be deleted
    //req.user.token is the database tokens
    //currentElement.token is the current token in database
    //req.token is the token stored in the cookie

    res.clearCookie("jwt"); //to delete the stored cookie named jwt
    console.log("logout successful");

    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/logoutall", auth, async (req, res) => {
  //with auth, it will check if token/ cookie is available or not
  try {
    console.log("This is req.user= " + req.user); //the one who logs in

    //to logout from all devices!

    req.user.tokens = []; //tokens field in DB gets empty

    res.clearCookie("jwt"); //to delete the stored cookie named jwt
    console.log("logout successful");

    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  try {
    const registerUser = new Register({
      email: req.body.email,
      password: req.body.password,
    });

    //getting the generated token
    const token = await registerUser.generateAuthToken();
    console.log(`the token part ${token}`);

    res.cookie("jwt", token, {
      //jwt is set the name of the cookie
      expires: new Date(Date.now() + 30000), //expires in 3 sec w.r.t current date
      httpOnly: true, //so cookies can't be modified by Js
    });

    const saveUser = await registerUser.save();
    console.log(`the page part ${saveUser}`);
    res.status(201).render("index");
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const inputEmail = req.body.email; //user input data
    const inputPassword = req.body.password;

    const id = await Register.findOne({ email: inputEmail }); //array destructuring is used, found data can be used by id e.g. id.email, id becomes the object(instance) here

    const token = await id.generateAuthToken(); //id is the instance
    console.log(`the token part ${token}`);

    const isMatch = await bcrypt.compare(inputPassword, id.password); //to match the bcrypt hashed password-returns true/false

    res.cookie("jwt", token, {
      //jwt is set the name of the cookie
      expires: new Date(Date.now() + 50000), //expires in 3 sec w.r.t current date
      httpOnly: true, //so cookies can't be modified by Js
      // secure: true, //cookie will be visible only in https connection
    });

    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("username/pass incorrect");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.listen(port, () => {
  console.log(`Listening at ${port}`);
});
