import express from "express";
import {
  createUser,
  deleteUser,
  getTeacherConsultancyApplications,
  getUsers,
  loginUser,
  updateUserById,
} from "../controller/userController.js";
import authenticateToken from "../authentication/userAuth.js";

const userRoute = express.Router();

userRoute.post("/login", loginUser);

userRoute.post("/create", authenticateToken, createUser);
userRoute.get("/getAllUsers", authenticateToken, getUsers);
userRoute.put("/update/:id", authenticateToken, updateUserById);
userRoute.delete("/delete/:id", authenticateToken, deleteUser);
userRoute.get(
  "/teacher/applications/:userId",
  authenticateToken,
  getTeacherConsultancyApplications
);

export default userRoute;
