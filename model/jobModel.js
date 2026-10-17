import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    companyName: {
      type: String,
      default: "Tekisky Pvt. Ltd.",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Department / Category is required"],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    primarySkill: {
      type: String,
      required: [true, "Primary technical skill / role is required"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Experience specification is required"],
      trim: true, // e.g. "3–5 years"
    },
    minExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    relevantExperience: {
      type: String,
      default: "",
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, "At least one skill is required"],
      default: [],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      default: "Pune, India",
      trim: true,
    },
    workMode: {
      type: String,
      required: [true, "Work mode is required"],
      enum: ["On-site", "Hybrid", "Remote"],
      default: "Hybrid",
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Contract", "Part-time", "Internship"],
      default: "Full-time",
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    salaryRange: {
      type: String,
      default: "",
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Closed"],
      default: "Published",
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      default: "Admin",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performant search and public filtering
JobSchema.index({ status: 1, postedDate: -1 });
JobSchema.index({ category: 1, status: 1 });
JobSchema.index({ title: "text", primarySkill: "text", description: "text" });

const Job = mongoose.model("Job", JobSchema);

export default Job;
