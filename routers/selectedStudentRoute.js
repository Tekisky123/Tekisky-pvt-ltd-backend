import express from "express";
import {
  createSelectedStudents,
  deleteSelectedStudent,
  getAllSelectedStudents,
  updateSelectedStudent,
} from "../controller/selectedStudentController.js";
import authenticateToken from "../authentication/userAuth.js";

const selectedStudentRoute = express.Router();

selectedStudentRoute.get("/getSelectedStudent", getAllSelectedStudents);
selectedStudentRoute.post("/create",authenticateToken, createSelectedStudents);
selectedStudentRoute.delete("/delete/:id",authenticateToken, deleteSelectedStudent);
selectedStudentRoute.put("/update/:id",authenticateToken, updateSelectedStudent);

export default selectedStudentRoute;
