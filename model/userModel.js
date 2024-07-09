import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["admin", "teacher"], required: true },
  collegeName: { type: String, trim: true },
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
