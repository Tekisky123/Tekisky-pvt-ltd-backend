const mongoose = require('mongoose');

const ConsultancySchema = new mongoose.Schema({
  tekiskyEmployeeNumber: { type: String, required: true },
  fullName: { type: String, required: true },
  emailAddress: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  tenthPercentage: { type: Number, required: true },
  twelfthPercentage: { type: Number, required: true },
  diplomaPercentage: { type: Number, required: true },
  degreePercentage: { type: Number, required: true },
  nameOfDegree: { type: String, required: true },
  yearOfPassing: { type: Number, required: true },
  resumeUrl: { type: String, required: true }
});

const Consultancy = mongoose.model('Consultancy', ConsultancySchema);

module.exports = Consultancy;