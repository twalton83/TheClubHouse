const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  membership: { type: Boolean, required: true },
  password: { type: String, required: true },
  username : { type: String, required: true },
  admin : {type: Boolean, default: false}
});

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});


module.exports = mongoose.model("User", userSchema);
