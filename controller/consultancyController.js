import AWS from "aws-sdk";
import nodemailer from "nodemailer";
import Consultancy from "../model/consultancyModel.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWSS_OPEN_KEY,
  secretAccessKey: process.env.AWSS_SEC_KEY,
  region: process.env.AWSS_REGION,
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Resilient file storage: attempts AWS S3, falls back to local disk if S3 fails
const saveResumeFile = async (file, fullName) => {
  if (!file) return "";

  const sanitizedName = (fullName || "candidate")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .slice(0, 40);
  const originalCleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${sanitizedName}_${Date.now()}_${originalCleanName}`;

  // Try S3 first if configured
  if (
    process.env.AWSS_BUCKET_NAME &&
    process.env.AWSS_OPEN_KEY &&
    process.env.AWSS_SEC_KEY
  ) {
    try {
      const uploadParams = {
        Bucket: process.env.AWSS_BUCKET_NAME,
        Key: `resume/${fileName}`,
        Body: file.buffer,
      };
      const uploadResult = await s3.upload(uploadParams).promise();
      if (uploadResult && uploadResult.Location) {
        return uploadResult.Location;
      }
    } catch (s3Error) {
      console.warn(
        "AWS S3 upload failed; safely falling back to local file storage:",
        s3Error.message
      );
    }
  }

  // Fallback to local server disk storage
  try {
    const uploadDir = path.join(process.cwd(), "uploads", "resumes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/resumes/${fileName}`;
  } catch (diskError) {
    console.error("Local resume storage error:", diskError.message);
    return "";
  }
};

const uploadResume = async (req, res) => {
  try {
    const { file } = req;

    // Resilient resume file upload
    const resumeLocation = await saveResumeFile(file, req.body.fullName);

    // Normalize skills
    let skillsList = [];
    if (Array.isArray(req.body.skills)) {
      skillsList = req.body.skills;
    } else if (typeof req.body.skills === "string" && req.body.skills.trim()) {
      skillsList = req.body.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const candidateCategory = req.body.candidateCategory || "Experienced";
    const applicationType =
      req.body.applicationType || (req.body.jobId ? "job_specific" : "general");

    // Create new consultancy document
    const newConsultancy = new Consultancy({
      candidateCategory,
      applicationType,
      jobId: req.body.jobId || null,
      jobTitle: req.body.jobTitle || "",
      employeeNumber: req.body.employeeNumber || "",
      fullName: req.body.fullName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      primarySkill: req.body.primarySkill || "",
      yearsOfExperience:
        req.body.yearsOfExperience || req.body.totalExperience || "",
      relevantExperience: req.body.relevantExperience || "",
      currentLocation: req.body.currentLocation || "",
      preferredLocation: req.body.preferredLocation || "",
      preferredWorkMode: req.body.preferredWorkMode || "",
      noticePeriod: req.body.noticePeriod || "",
      linkedIn: req.body.linkedIn || "",
      currentCTC: req.body.currentCTC || "",
      expectedCTC: req.body.expectedCTC || "",
      highestQualification: req.body.highestQualification || "",
      graduationYear: req.body.graduationYear || "",
      internshipDetails: req.body.internshipDetails || "",
      tenthPercentage: req.body.tenthPercentage
        ? Number(req.body.tenthPercentage)
        : undefined,
      twelthPercentage: req.body.twelthPercentage
        ? Number(req.body.twelthPercentage)
        : undefined,
      twelthCollegeName: req.body.twelthCollegeName || "",
      diplomaPercentage: req.body.diplomaPercentage
        ? Number(req.body.diplomaPercentage)
        : undefined,
      degreePercentage: req.body.degreePercentage
        ? Number(req.body.degreePercentage)
        : undefined,
      diplomaCollegeName: req.body.diplomaCollegeName || "",
      degreeName: req.body.degreeName || "",
      degreeCollegeName: req.body.degreeCollegeName || "",
      yearOfPassing: req.body.yearOfPassing
        ? Number(req.body.yearOfPassing)
        : undefined,
      skills: skillsList,
      workStatus:
        req.body.workStatus ||
        (candidateCategory === "Fresher" ? "Fresher" : "Experience"),
      referredBy: req.body.referredBy || "",
      extraInformation: req.body.extraInformation || "",
      englishSpeaking: req.body.englishSpeaking || "",
      englishWriting: req.body.englishWriting || "",
      mockInterviewDate: req.body.mockInterviewDate || "",
      mockInterviewTime: req.body.mockInterviewTime || "",
      resumeUrl: resumeLocation,
      privacyConsent:
        req.body.privacyConsent === "true" || req.body.privacyConsent === true,
      status: "Submitted",
    });

    await newConsultancy.save();

    const applicationLink = `${process.env.WEBSITE_URL || "https://tekisky.com/"}singleApplication/${newConsultancy._id}`;

    // Safely attempt email notifications without failing candidate submission if SMTP is misconfigured
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: req.body.email,
          subject: "Tekisky Recruitment - Profile Submission Confirmation",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0092d5; text-align: center;">Tekisky Pvt Ltd · Recruitment Portal</h2>
              <p>Dear ${req.body.fullName},</p>
              <p>Thank you for submitting your application to Tekisky Pvt Ltd. We have received your professional profile${
                newConsultancy.jobTitle
                  ? ` for the role: <strong>${newConsultancy.jobTitle}</strong>`
                  : ""
              }.</p>
              <p>Your Application Reference ID is: <strong>${newConsultancy._id}</strong></p>
              <p>Our recruitment team reviews your skills and experience against relevant client mandates. If a suitable match is available, our talent team will contact you directly for next steps.</p>
              <p style="margin-top: 20px; font-size: 13px; color: #64748b;">Notice: Registration does not guarantee an interview or job placement. Candidates will be contacted when a suitable opportunity is available.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">Tekisky Pvt Ltd · Career Opportunities Portal</p>
            </div>
          `,
        });
      }
    } catch (mailErr) {
      console.warn("Candidate email delivery skipped/failed:", mailErr.message);
    }

    return res.status(200).json({
      message: "Application submitted successfully",
      applicationId: newConsultancy._id,
      applicationType: newConsultancy.applicationType,
      jobTitle: newConsultancy.jobTitle || "",
      candidateCategory: newConsultancy.candidateCategory,
    });
  } catch (error) {
    console.error("Error in uploadResume:", error.message);
    return res.status(500).json({ error: "Failed to upload resume" });
  }
};

const getAllUploadResume = async (req, res) => {
  try {
    const consultancies = await Consultancy.find();
    res.status(200).json(consultancies);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
};

const getOneUploadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rating,
      status,
      comments,
      mockInterviewResponse,
      mockInterviewFeedback,
      communicationSkillRating,
      technicalRoundComments,
    } = req.body;

    const updatedConsultancy = await Consultancy.findByIdAndUpdate(
      id,
      {
        rating,
        status,
        comments,
        mockInterviewResponse,
        mockInterviewFeedback,
        communicationSkillRating,
        technicalRoundComments,
      },
      { new: true }
    );

    if (!updatedConsultancy) {
      return res.status(404).json({ error: "Consultancy not found" });
    }

    await sendStatusChangeEmail(updatedConsultancy);

    res.status(200).json({
      message: "Consultancy updated successfully",
      updatedConsultancy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update consultancy" });
  }
};

const sendStatusChangeEmail = async (consultancy) => {
  try {
    let emailContent = `
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
    <a href="https://www.tekisky.com">
    <h2 style="color: #007bff; text-align: center;">Tekisky Pvt Ltd</h2>
    </a>
  
  <h2 style="color: #007bff; text-align: center; margin-bottom: 20px;"> Change in Your Application Status</h2>
  <p style="margin-bottom: 10px;">Dear ${consultancy.fullName},</p>
  <p>We are writing to inform you about an important update regarding your application at Tekisky Pvt Ltd.</p>
  <p>Your application status has recently been modified to:</p>
  <div style="text-align: center; margin-bottom: 20px;"><strong>${consultancy.status}</strong></div>
  <p>We understand the significance of your job search and want to ensure you are kept informed throughout the process.</p>
  <p>Please feel free to reach out to us if you have any questions or require further clarification regarding your application status.</p>
  <table style="margin-top: 20px; width: 100%;">
  <tr>
    <td class="footer" style="text-align: end;">
      Best Regards,<br>
      The Recruitment Team<br>
      Tekisky Pvt Ltd <br>
      <a href="mailto:hr@tekisky.com">hr@tekisky.com</a><br>
      <a href="tel:+918625817334">+91 8625817334</a>
    </td>
  </tr>
</table>
</div>

    `;

    if (
      consultancy.status === "Mock Interview Done" &&
      consultancy.mockInterviewFeedback
    ) {
      emailContent += `
      <a href="https://www.tekisky.com">
      <h2 style="color: #007bff; text-align: center;">Tekisky Pvt Ltd</h2>
      </a>
<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">

  <h2 style="color: #007bff; text-align: center; margin-bottom: 20px;">Review Your Mock Interview Feedback</h2>
  <p style="margin-bottom: 10px;">Hello <strong>${consultancy.fullName}</strong>,</p>
  <p>We're pleased to share with you the feedback from your recent mock interview. This valuable insight has been tailored to help you grow and refine your interview skills.</p>
  <p>Take some time to review the feedback provided:</p>
  <div><h2><b>${consultancy.mockInterviewFeedback}</b></h2></div>
  <p>Remember, feedback is a gift that allows us to learn and improve. Use this information to continue your professional development journey.</p>
  <table style="margin-top: 20px; width: 100%;">
  <tr>
    <td class="footer" style="text-align: end;">
      Best Regards,<br>
      The Recruitment Team<br>
      Tekisky Pvt Ltd <br>
      <a href="mailto:hr@tekisky.com">hr@tekisky.com</a><br>
      <a href="tel:+918625817334">+91 8625817334</a>
    </td>
  </tr>
</table>
</div>

      `;
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: consultancy.email,
      subject:
        "Exciting Update: Your Application Status & Mock Interview Feedback!",
      html: emailContent,
    });
  } catch (error) {
    console.error("Oops! Error sending status change email:", error);
  }
};

const deleteUploadResume = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedConsultancy = await Consultancy.findByIdAndDelete(id);

    if (!deletedConsultancy) {
      return res.status(404).json({ error: "Consultancy not found" });
    }

    res.status(200).json({
      message: "Consultancy deleted successfully",
      deletedConsultancy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete consultancy" });
  }
};

const getOneUploadResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    const consultancy = await Consultancy.findById(id);

    if (!consultancy) {
      return res.status(404).json({ error: "Consultancy not found" });
    }

    res.status(200).json(consultancy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get consultancy by ID" });
  }
};

const assignAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      assessmentTask,
      assessmentDeadline,
      assessmentDescription,
      assessmentNote,
      selectedAssessmentCategory,
    } = req.body;

    const updatedConsultancy = await Consultancy.findByIdAndUpdate(
      id,
      {
        status: "Assessment Assigned",
        assessmentTask: assessmentTask,
        assessmentDeadline: assessmentDeadline,
        assessmentDescription: assessmentDescription,
        assessmentNote: assessmentNote,
        selectedAssessmentCategory: selectedAssessmentCategory,
      },
      { new: true }
    );

    if (!updatedConsultancy) {
      return res.status(404).json({ error: "Consultancy not found" });
    }

    const submissionLink = `${process.env.WEBSITE_URL}submit-assessment/${updatedConsultancy._id}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: updatedConsultancy.email,
      subject: "Assessment Assignment",
      html: `
      <div style="text-align: center; margin-top: 20px;">
      <a href="https://www.tekisky.com">
      <h2 style="color: #007bff; text-align: center;">Tekisky Pvt Ltd</h2>
      </a>
</div>
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #007bff; text-align: center;">Assessment Assigned</h2>
          <p>Dear ${updatedConsultancy.fullName},</p>
          <p>We are pleased to inform you that an assessment task has been assigned to you. </p>
          <p>The Assessment is on <strong>${selectedAssessmentCategory}</strong></p>
          <p><strong>Assessment Task:</strong> ${assessmentTask}</p>
          <p><strong>Assessment Description:</strong> ${assessmentDescription}</p>
          <p><strong>Deadline:</strong> ${assessmentDeadline}</p>
          <p style="color: red">Please complete the assessment on time and click the button below to submit your completed assessment:</p>
          <p><strong>Note:</strong> ${assessmentNote}</p>

          <p style="text-align: center;">
            <a href="${submissionLink}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Submit Your Assignment</a>
          </p>
          <table style="margin-top: 20px; width: 100%;">
  <tr>
    <td class="footer" style="text-align: end;">
      Best Regards,<br>
      The Recruitment Team<br>
      Tekisky Pvt Ltd <br>
      <a href="mailto:hr@tekisky.com">hr@tekisky.com</a><br>
      <a href="tel:+918625817334">+91 8625817334</a>
    </td>
  </tr>
</table>
        </div>
      `,
    });

    res.status(200).json({ message: "Assessment assigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to assign assessment" });
  }
};

const submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { file } = req;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const uploadParams = {
      Bucket: process.env.AWSS_BUCKET_NAME,
      Key: `assessments/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    let uploadResult;
    try {
      uploadResult = await s3.upload(uploadParams).promise();
    } catch (s3Error) {
      console.error("Error uploading file to S3:", s3Error);
      return res.status(500).json({ error: "File upload to S3 failed" });
    }

    let consultancy;
    try {
      consultancy = await Consultancy.findByIdAndUpdate(
        id,
        {
          status: "Assessment Submitted",
          "assessmentSubmission.fileName": file.originalname,
          "assessmentSubmission.fileContent": uploadResult.Location,
          "assessmentSubmission.submissionDate": new Date(),
        },
        { new: true }
      );
    } catch (dbError) {
      console.error("Error updating consultancy in database:", dbError);
      return res.status(500).json({ error: "Database update failed" });
    }

    if (!consultancy) {
      console.error("Consultancy not found with ID:", id);
      return res.status(404).json({ error: "Consultancy not found" });
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: consultancy.email,
        subject: "Assessment Submission Confirmation",
        html: `
          <div style="text-align: center; margin-top: 20px;">
          <a href="https://www.tekisky.com">
          <h2 style="color: #007bff; text-align: center;">Tekisky Pvt Ltd</h2>
          </a>
          </div>
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #007bff; text-align: center;">Assessment Submitted</h2>
            <p>Dear ${consultancy.fullName},</p>
            <p>Thank you for submitting your assessment. We have received your submission and will review it shortly. Your commitment to this process is appreciated, and we understand the effort it takes to complete this assessment.</p>
            <p>Our team will carefully evaluate your submission, considering all aspects of the assessment criteria. We aim to provide comprehensive feedback that will assist you in your professional development.</p>
            <p>Should you have any questions or concerns regarding the assessment process or your submission, please don't hesitate to reach out to us. We are here to support you throughout this process.</p>
            <p>Best Regards,</p>
            <p>The Recruitment Team</p>
            <p>Tekisky Pvt Ltd</p>
            <p style="margin-top: 10px;">Email: <a href="mailto:hr@tekisky.com" style="color: #007bff; text-decoration: none;">hr@tekisky.com</a></p>
            <p>Phone: <a href="tel:+918625817334" style="color: #007bff; text-decoration: none;">+91 8625817334</a></p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email to consultancy:", emailError);
      return res.status(500).json({ error: "Email to consultancy failed" });
    }

    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: `Assessment Submission from ${consultancy.fullName}`,
        html: `
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
          <a href="https://www.tekisky.com">
          <h2 style="color: #007bff; text-align: center;">Tekisky Pvt Ltd</h2>
          </a>
            <h2 style="color: #007bff; text-align: center;">Assessment Submission</h2>
            <p>Dear Admin,</p>
            <p>The following student has submitted their assessment:</p>
            <p><strong>Name:</strong> ${consultancy.fullName}</p>
            <p><strong>Email:</strong> ${consultancy.email}</p>
            <p><strong>Employee Number:</strong> ${consultancy.employeeNumber}</p>
            <p>Please review the assessment at the following link:</p>
            <p><a href="${uploadResult.Location}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;" target="_blank">View Assessment</a></p>
            <div style="margin-top: 30px;">
              <h3 style="color: #007bff; margin-bottom: 15px;">Assessment Details:</h3>
              <p><strong>Assessment Category:</strong> ${consultancy.selectedAssessmentCategory}</p>
              <p><strong>Assessment Task:</strong> ${consultancy.assessmentTask}</p>
              <p><strong>Assessment Description:</strong> ${consultancy.assessmentDescription}</p>
              <p><strong>Submission Deadline:</strong> ${consultancy.assessmentDeadline}</p>
            </div>
          </div>
        `,
      });
    } catch (adminEmailError) {
      console.error("Error sending email to admin:", adminEmailError);
      return res.status(500).json({ error: "Email to admin failed" });
    }

    res.status(200).json({ message: "Assessment submitted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Failed to submit assessment" });
  }
};

export {
  uploadResume,
  getAllUploadResume,
  getOneUploadResume,
  deleteUploadResume,
  getOneUploadResumeById,
  submitAssessment,
  assignAssessment,
};
