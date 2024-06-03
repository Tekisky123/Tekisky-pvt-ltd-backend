import AWS from "aws-sdk";
import nodemailer from "nodemailer";
import Consultancy from "../model/consultancyModel.js";
import dotenv from "dotenv";

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

const uploadResume = async (req, res) => {
  try {
    const { file } = req;
    const { id } = req.params;
    console.log("id", req.params.id);

    // Upload file to S3
    const uploadParams = {
      Bucket: process.env.AWSS_BUCKET_NAME,
      Key: `resume/${req.body.fullName}_${file.originalname}`,
      Body: file.buffer,
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Create new consultancy document
    const newConsultancy = new Consultancy({
      employeeNumber: req.body.employeeNumber,
      fullName: req.body.fullName,
      email: req.body.email,
      mobileNumber: req.body.mobileNumber,
      tenthPercentage: req.body.tenthPercentage,
      twelthPercentage: req.body.twelthPercentage,
      twelthCollegeName: req.body.twelthCollegeName,
      diplomaPercentage: req.body.diplomaPercentage,
      degreePercentage: req.body.degreePercentage,
      diplomaCollegeName: req.body.diplomaCollegeName,
      degreeName: req.body.degreeName,
      degreeCollegeName: req.body.degreeCollegeName,
      yearOfPassing: req.body.yearOfPassing,
      skills: req.body.skills,
      yearsOfExperience: req.body.yearsOfExperience,
      workStatus: req.body.workStatus,
      referredBy: req.body.referredBy,
      extraInformation: req.body.extraInformation,
      englishSpeaking: req.body.englishSpeaking,
      englishWriting: req.body.englishWriting,
      mockInterviewDate: req.body.mockInterviewDate,
      mockInterviewTime: req.body.mockInterviewTime,
      resumeUrl: uploadResult.Location,
    });

    await newConsultancy.save();
    // console.log(newConsultancy);
    // console.log(newConsultancy._id);
    // console.log(object);
    const applicationLink = `${process.env.WEBSITE_URL}singleApplication/${newConsultancy._id}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: req.body.email,
      subject: "Resume Submission Confirmation",
      html: `
        <html xmlns="http://www.w3.org/1999/xhtml">
          <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0;">
            <meta name="format-detection" content="telephone=no"/>
            <style>
              body {
                margin: 0;
                padding: 0;
                min-width: 100%;
                width: 100% !important;
                height: 100% !important;
                background-color: #ffffff;
                color: #000000;
                font-family: Arial, sans-serif;
              }
              table {
                border-collapse: collapse;
                width: 100%;
              }
              td {
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                padding-bottom: 20px;
              }
              .header img {
                max-width: 200px;
                height: auto;
                border-radius:8px;
              }
              .content {
                font-size: 16px;
                line-height: 1.6;
              }
              .content p {
                margin-bottom: 20px;
              }
              .content a {
                color: #007bff;
                text-decoration: underline;
              }
              .footer {
                margin-top: 20px;
                text-align: right;
                font-style: italic;
                color: #777777;
              }
            </style>
            <title>Resume Submission Confirmation</title>
          </head>
          <body>
            <table class="container">
              <tr>
                <td class="header">
                  <a href="https://www.tekisky.com">
                  </a>
                </td>
              </tr>
              <tr>
                <td class="content">
                  <h1 style="color: #007bff; text-align: center;">Resume Submission Confirmation</h1>
                  <p>Dear ${req.body.fullName},</p>
                  <p>Thank you for submitting your resume to Tekisky Pvt Ltd. We appreciate your interest in exploring career opportunities with us.</p>
                  <p>Your resume has been successfully submitted to our database. Our team will review your profile and keep it on file for future reference.</p>
                  <p>Please note that if we have any requirements from other companies that match your profile, we may contact you for further discussion.</p>
                  <p>In the meantime, feel free to explore our <a href="https://www.tekisky.com">Tekisky Pvt Ltd</a> to learn more about Tekisky Pvt Ltd and the services we offer.</p>
                  <p>Thank you once again for considering Tekisky Pvt Ltd as a potential platform for your career growth.</p>
                </td>
              </tr>
              <div style="text-align: center; margin-top: 20px;">
              <a href="${applicationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">View Your Application</a>
            </div>
              <tr>
                <td class="footer">
                  Best Regards,<br>
                  The Recruitment Team<br>
                  Tekisky Pvt Ltd <br>
                  <a href="mailto:hr@tekisky.com">hr@tekisky.com</a><br>
                  <a href="tel:+918625817334">+91 8625817334</a>

                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "📥 New Resume Uploaded: Review Now! 📝",
      html: `
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #007bff; text-align: center;">New Resume Uploaded</h2>
            <p style="margin-bottom: 10px;"><strong>Student Name:</strong> ${req.body.fullName}</p>
            <p style="margin-bottom: 10px;"><strong>Email:</strong> ${req.body.email}</p>
            <p style="margin-bottom: 10px;"><strong>Mobile Number:</strong> ${req.body.mobileNumber}</p>
            <p><strong>Resume Preview:</strong></p>
            <p>Click <a href="${uploadResult.Location}" target="_blank">here</a> to view the resume. 📄</p>
            <div style="text-align: center; margin-top: 20px;">
            <a href="${applicationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">View Application</a>
          </div>
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

    res.status(200).json({ message: "Resume uploaded successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to upload resume" });
  }
};

const getAllUploadResume = async (req, res) => {
  try {
    const consultancies = await Consultancy.find();
    res.status(200).json(consultancies);
  } catch (error) {
    console.error(error);
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
    } = req.body;

    const updatedConsultancy = await Consultancy.findByIdAndUpdate(
      id,
      {
        rating,
        status,
        comments,
        mockInterviewResponse,
        mockInterviewFeedback,
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
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="cid:logo" alt="Tekisky Pvt Ltd Logo" style="max-width: 200px; height: auto; border-radius: 8px;">
  </div>
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
      <div style="text-align: center; margin-top: 20px;">
  <img src="cid:logo" alt="Tekisky Pvt Ltd Logo" style="max-width: 200px; height: auto; border-radius: 8px;">
</div>
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
      attachments: [
        {
          filename: "logo.jpg",
          path: "./logo.jpg",
          cid: "logo",
        },
      ],
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
  <img src="cid:logo" alt="Tekisky Pvt Ltd Logo" style="max-width: 200px; height: auto; border-radius: 8px;">
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
      attachments: [
        {
          filename: "logo.jpg",
          path: "./logo.jpg",
          cid: "logo",
        },
      ],
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
            <img src="cid:logo" alt="Tekisky Pvt Ltd Logo" style="max-width: 200px; height: auto; border-radius: 8px;">
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
        attachments: [
          {
            filename: "logo.jpg",
            path: "./logo.jpg",
            cid: "logo",
          },
        ],
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
            <h2 style="color: #007bff; text-align: center;">Assessment Submission</h2>
            <p>Dear Admin,</p>
            <p>The following student has submitted their assessment:</p>
            <p><strong>Name:</strong> ${consultancy.fullName}</p>
            <p><strong>Email:</strong> ${consultancy.email}</p>
            <p><strong>Employee Number:</strong> ${consultancy.employeeNumber}</p>
            <p>Please review the assessment at the following link:</p>
            <p><a href="${uploadResult.Location}" target="_blank">View Assessment</a></p>
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
