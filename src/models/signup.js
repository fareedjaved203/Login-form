const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
  tokens: [
    //words remain the same everytime, here jwt token no. is saved
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//generating token jwt
userSchema.methods.generateAuthToken = async function () {
  //here we are going to deal with the instance, that is why we wrote methods.
  try {
    console.log(this._id);
    const token = jwt.sign(
      { _id: this._id.toString() },
      "mynameismuhammadfareedjaved"
    );
    this.tokens = this.tokens.concat({ token: token }); //saving the token value in token field
    await this.save();
    console.log(token);
    return token;
  } catch (error) {
    res.send(error);
    console.log("the error part: " + error);
  }
};

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
