import express from "express";
import { getAllUploadResume, uploadResume } from "../controller/consultancyController.js";


const consultancyRoute = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/uploadResume', upload.single('resume'), uploadResume);
router.get('/getAllUploadResume', getAllUploadResume);

export default consultancyRoute;
