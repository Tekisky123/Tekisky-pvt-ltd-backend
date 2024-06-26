import express from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  loginUser,
  updateUserById,
} from "../controller/userController.js";
import authenticateToken from "../authentication/userAuth.js";

const userRoute = express.Router();

userRoute.post("/create",authenticateToken, createUser);
userRoute.post("/login", loginUser);
userRoute.get("/getAllUsers", authenticateToken, getUsers);
userRoute.put("/update/:id", authenticateToken, updateUserById);
userRoute.delete("/delete/:id", authenticateToken, deleteUser);

export default userRoute;
