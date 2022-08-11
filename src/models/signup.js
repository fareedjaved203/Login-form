const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        console.log("Invalid Email");
      }
    },
  },
  password: {
    type: String,
    required: true,
  },
});

//password bcryption (hashing + middleware)
//pre() takes 2 arguments... save hone se pehle ye wala function execute ho
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    console.log(`${this.password}`);
    this.password = await bcrypt.hash(this.password, 10); //10 are the rounds here
    console.log(`${this.password}`);
  }
  next(); //means, now move on to save(), warna ye nai pta chle ga k is function k execute hone k bad kya krna ha
});

const Register = new mongoose.model("Register", userSchema);

module.exports = Register;
