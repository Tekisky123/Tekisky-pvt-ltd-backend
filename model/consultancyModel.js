import mongoose from "mongoose";

const ConsultancySchema = new mongoose.Schema(
  {
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
    yearsOfExperience: { type: String },
    resumeUrl: { type: String },
    mockInterviewDate: { type: String },
    mockInterviewTime: { type: String },
    mockInterviewFeedback: { type: String },
    referredBy: { type: String },
    extraInformation: { type: String },
    englishSpeaking: { type: String },
    englishWriting: { type: String },
    workStatus: { type: String },
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    communicationSkillRating: { type: Number, enum: [1, 2, 3, 4, 5] },
    technicalRoundComments: { type: String },
    comments: { type: String },
    status: {
      type: String,
      default: "New",
      enum: [
        "Verified",
        "New",
        "Rejected",
        "Mock Interview Done",
        "Assessment Assigned",
        "Assessment Submitted",
      ],
    },
    assessmentTask: {
      type: String,
      default: "",
    },
    customTask: { type: String },
    assessmentDeadline: {
      type: Date,
    },
    assessmentNote: { type: String },
    selectedAssessmentCategory: { type: String },
    assessmentDescription: { type: String },
    assessmentSubmission: {
      fileName: {
        type: String,
        default: "",
      },
      fileContent: {
        type: Buffer,
        default: null,
      },
      submissionDate: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Consultancy = mongoose.model("Consultancy", ConsultancySchema);

export default Consultancy;
