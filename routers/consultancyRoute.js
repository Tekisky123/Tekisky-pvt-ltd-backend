import express from "express";
import { getAllUploadResume, uploadResume } from "../controller/consultancyController.js";
import multer from "multer";

const consultancyRoute = express.Router();

// Define a function to filter files by MIME type
const fileFilter = (req, file, cb) => {
    // Check if the file MIME type is PDF or document type (e.g., docx, txt, etc.)
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'text/plain' ||
        file.mimetype === 'application/rtf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      // Accept the file
      cb(null, true);
    } else {
      // Reject the file
      cb(new Error('File type not supported'), false);
    }
  };
  

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter // Apply the file filter
});

consultancyRoute.post('/uploadResume', upload.single('resume'), uploadResume);
consultancyRoute.get('/getAllUploadResume', getAllUploadResume);

export default consultancyRoute;
