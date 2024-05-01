import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from 'cors';
import morgan from "morgan";
import sendFormDataEmail from "./NodeMailer.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT;

const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(morgan('tiny'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/submitForm", (req, res) => {
    const { name, email, message, mobile } = req.body;

    
    sendFormDataEmail({ name, email, message, mobile });

    res.status(200).send("Form submitted successfully");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
