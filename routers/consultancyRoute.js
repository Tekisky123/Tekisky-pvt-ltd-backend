import express from "express";
import { getAllUploadResume, uploadResume } from "../controller/consultancyController.js";
import multer from "multer";

const consultancyRoute = express.Router();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'text/plain' ||
        file.mimetype === 'application/rtf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    } 
  };
  

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter 
});

consultancyRoute.post('/uploadResume', upload.single('resume'), uploadResume);
consultancyRoute.get('/getAllUploadResume', getAllUploadResume);

export default consultancyRoute;
