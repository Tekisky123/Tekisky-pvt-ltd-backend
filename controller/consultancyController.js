import Consultancy from './consultancyModel';
import AWS from 'aws-sdk';
import nodemailer from 'nodemailer';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tekiskymart920@gmail.com",
      pass: "unol ktol sndf viob",
    },
});

const uploadResume = async (req, res) => {
  try {
    const { file } = req;

    // Upload file to S3
    const uploadParams = {
      Bucket: 'your-s3-bucket-name',
      Key: file.originalname,
      Body: file.buffer
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Create new consultancy document
    const newConsultancy = new Consultancy({
      tekiskyEmployeeNumber: req.body.tekiskyEmployeeNumber,
      fullName: req.body.fullName,
      emailAddress: req.body.emailAddress,
      mobileNumber: req.body.mobileNumber,
      tenthPercentage: req.body.tenthPercentage,
      twelfthPercentage: req.body.twelfthPercentage,
      diplomaPercentage: req.body.diplomaPercentage,
      degreePercentage: req.body.degreePercentage,
      nameOfDegree: req.body.nameOfDegree,
      yearOfPassing: req.body.yearOfPassing,
      resumeUrl: uploadResult.Location
    });

    // Save consultancy document to database
    await newConsultancy.save();

    // Send confirmation email
    await transporter.sendMail({
      from: 'tekiskymart920@gmail.com',
      to: req.body.emailAddress,
      subject: 'Resume Submission Confirmation',
      text: `Your form has been submitted. Our dedicated team will review your submission and consider you for suitable positions within our company.`
    });

    // Send notification email
    await transporter.sendMail({
      from: 'tekiskymart920@gmail.com',
      to: 'notification@example.com',
      subject: 'New Resume Uploaded',
      text: `A new resume has been uploaded. Please check the S3 bucket.`
    });

    res.status(200).json({ message: 'Resume uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};

const getAllUploadResume = async (req, res) => {
  try {
    const consultancies = await Consultancy.find();
    res.status(200).json(consultancies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
};

export { uploadResume, getAllUploadResume };
