const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
require("./db/conn");
const Register = require("./models/signup");
const jwt = require("jsonwebtoken");

app.use(express.json()); //to understand the incoming json data (from postman)
app.use(express.urlencoded({ extended: false })); //to get the form value data

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
