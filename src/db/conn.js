const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/signup-form", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log(`Database is Connected`);
  })
  .catch((e) => {
    console.log(`Database is Not Connected`);
  });
