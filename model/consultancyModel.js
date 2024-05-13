import mongoose from "mongoose";

const ConsultancySchema = new mongoose.Schema({
  employeeNumber: { type: String },
  fullName: { type: String },
  email: { type: String },
  mobileNumber: { type: String },
  tenthPercentage: { type: Number },
  twelthPercentage: { type: Number },
  twelthCollegeName: { type: String },
  diplomaPercentage: { type: Number },
  degreePercentage: { type: Number },
  diplomaCollegeName: { type: String },
  degreeName: { type: String },
  degreeCollegeName: { type: String },
  yearOfPassing: { type: Number },
  skills: { type: [String] },
  yearsOfExperience: { type:String },
  resumeUrl: { type: String },
});

const Consultancy = mongoose.model("Consultancy", ConsultancySchema);

export default Consultancy;
