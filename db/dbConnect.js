import mongoose from "mongoose";

let dbConnect = async (dburl, dbname) => {
  try {
    await mongoose.connect(dburl + dbname, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to db ");
  } catch (error) {
    console.log(error);
  }
};

export default dbConnect
