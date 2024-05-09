// app/models/studentModel.js
import mongoose from "mongoose";

const selectedStudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  education: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
  },
});

const selectedStudent = mongoose.model(
  "SelectedStudents",
  selectedStudentSchema
);

export default selectedStudent;
