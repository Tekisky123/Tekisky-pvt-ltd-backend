import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import selectedStudentRoute from "./routers/selectedStudentRoute.js";
import sendEmailRoute from "./routers/sendEmailRoute.js";
import dbConnect from "./db/dbConnect.js";
import userRoute from "./routers/userRoute.js";
import consultancyRoute from "./routers/consultancyRoute.js";

const app = express();
dotenv.config();

let PORT = process.env.PORT;
let dburl = process.env.DBURL;
let dbname = process.env.DBNAME;
dbConnect(dburl, dbname);

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan("tiny"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/email", sendEmailRoute);
app.use("/selectedStudent", selectedStudentRoute);
app.use("/user", userRoute);
app.use("/consultancy", consultancyRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
