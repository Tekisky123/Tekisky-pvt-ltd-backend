import mongoose from "mongoose";

const ConsultancySchema = new mongoose.Schema(
  {
    // Candidate profile classification
    candidateCategory: {
      type: String,
      enum: ["Experienced", "Fresher"],
      default: "Experienced",
    },
    applicationType: {
      type: String,
      enum: ["job_specific", "general"],
      default: "general",
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    jobTitle: {
      type: String,
      default: "",
    },

    // Core candidate info
    employeeNumber: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    resumeUrl: { type: String },

    // Professional details (Experienced candidates)
    primarySkill: { type: String },
    yearsOfExperience: { type: String },
    relevantExperience: { type: String },
    currentLocation: { type: String },
    preferredLocation: { type: String },
    preferredWorkMode: { type: String },
    noticePeriod: { type: String },
    linkedIn: { type: String },
    currentCTC: { type: String },
    expectedCTC: { type: String },

    // Education & fresher specific details
    highestQualification: { type: String },
    graduationYear: { type: String },
    internshipDetails: { type: String },
    tenthPercentage: { type: Number },
    twelthPercentage: { type: Number },
    twelthCollegeName: { type: String },
    diplomaPercentage: { type: Number },
    degreePercentage: { type: Number },
    diplomaCollegeName: { type: String },
    degreeName: { type: String },
    degreeCollegeName: { type: String },
    yearOfPassing: { type: Number },
    referredBy: { type: String },

    // Skills & status
    skills: { type: [String], default: [] },
    workStatus: { type: String },
    privacyConsent: { type: Boolean, default: true },
    mockInterviewDate: { type: String },
    mockInterviewTime: { type: String },
    mockInterviewFeedback: { type: String },
    extraInformation: { type: String },
    englishSpeaking: { type: String },
    englishWriting: { type: String },
    rating: { type: Number, enum: [1, 2, 3, 4, 5] },
    communicationSkillRating: { type: Number, enum: [1, 2, 3, 4, 5] },
    technicalRoundComments: { type: String },
    comments: { type: String },
    status: {
      type: String,
      default: "Submitted",
      enum: [
        "Submitted",
        "New",
        "Under Review",
        "Shortlisted",
        "Contacted",
        "Interview",
        "Mock Interview Done",
        "Assessment Assigned",
        "Assessment Submitted",
        "Verified",
        "Rejected",
        "Closed",
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
