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
});

const uploadResume = async (req, res) => {
  try {
    const { file } = req;

    // Upload file to S3
    const uploadParams = {
      Bucket: process.env.AWSS_BUCKET_NAME,
      Key: `resume/${Date.now()}_${file.originalname}`,
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
      interestedInMockInterview: req.body.interestedInMockInterview,
      resumeUrl: uploadResult.Location,
    });

    console.log(req.body);

    // Save consultancy document to database
    await newConsultancy.save();

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: req.body.email,
      subject: "⚠️⚠️Resume Submission Confirmation 🎉",
      html: `
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #007bff; text-align: center;">Resume Submission Confirmation</h1>
            <p>Dear ${req.body.fullName},</p>
            <p>Thank you for submitting your resume to Tekisky Pvt Ltd. We appreciate your interest in exploring career opportunities with us. 🚀</p>
            <p>Your resume has been successfully submitted to our database. Our team will review your profile and keep it on file for future reference. 📂</p>
            <p>Please note that if we have any requirements from other companies that match your profile, we may contact you for further discussion. 📞</p>
            <p>In the meantime, feel free to explore our <a href="https://www.tekisky.com">Tekisky Pvt Ltd</a> to learn more about Tekisky Pvt Ltd and the services we offer. 💼</p>
            <p>Thank you once again for considering Tekisky Pvt Ltd as a potential platform for your career growth. 🌟</p>
            <div style="margin-top: 20px; text-align: right; font-style: italic; color: #777;">Best Regards,<br>The Recruitment Team<br>Tekisky Pvt Ltd</div>
          </div>
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
    const { rating, status, comments, mockInterviewResponse,mockInterviewFeedback } = req.body;


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

    res
      .status(200)
      .json({
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
        <h2 style="color: #007bff; text-align: center;">🎉 Congratulations! Your Application Status Changed! 🚀</h2>
        <p style="margin-bottom: 10px;">Hello👋 ${consultancy.fullName},</p>
        <p>🔥We're thrilled to inform you that there's been an update on your application status with Tekisky Pvt Ltd.🚀</p>
        <p>Your application status has been changed to: </p>
        <div><h4>${consultancy.status}!🥳🎉</h4></div>
        <p>We know waiting can feel like waiting for a slow internet connection to load, but hang in there! 🕰️</p>
        <p>Stay curious, stay awesome, and keep coding! 💻</p>
        <div style="margin-top: 20px; text-align: right; font-style: italic; color: #777;">Warm Regards,<br>The Education Team<br>Tekisky Pvt Ltd</div>
      </div>
    `;

    // Include mock interview feedback if status is "Mock Interview Done"
    if (consultancy.status === "Mock Interview Done" && consultancy.mockInterviewFeedback) {
      emailContent += `
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #007bff; text-align: center;">🎤 Mock Interview Feedback: Unlock Insights into Your Performance! 💡</h2>
          <p style="margin-bottom: 10px;">Hi👋 <strong>${consultancy.fullName}</strong>,</p>
          <p>🚀Your mock interview feedback has arrived, and it's a gold mine of insights to help you grow and improve!🚀</p>
          <p>Ready to dive in? Here's what we've got:😃</p>
          <div><h4>${consultancy.mockInterviewFeedback}</h4></div>
          <p>Keep learning, keep coding, and keep shining! ✨</p>
          <div style="margin-top: 20px; text-align: right; font-style: italic; color: #777;">Happy Coding!<br>The Education Team<br>Tekisky Pvt Ltd</div>
        </div>
      `;
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: consultancy.email,
      subject: "⚠️⚠️ Exciting Update: Your Application Status & Mock Interview Feedback! 🚀",
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

export { uploadResume, getAllUploadResume, getOneUploadResume, deleteUploadResume, getOneUploadResumeById };


