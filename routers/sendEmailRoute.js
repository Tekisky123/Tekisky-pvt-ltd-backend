import express from "express";
import sendEmailController from "../controller/emailController.js";

const sendEmailRoute = express.Router();

sendEmailRoute.get("/sendEmail", sendEmailController);

export default sendEmailRoute;
