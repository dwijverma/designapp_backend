const mongoose = require("mongoose");
require("dotenv").config();

const URI = process.env.MONGO_DB_URI;

const connectDB = async (url) => {
  try {
    const connectionInstance = await mongoose.connect(`${URI}/database`);
    console.log("MongoDB connected successfully: ");
  } catch (error) {
    console.log("MongoDB connection error: ", error);
  }
};

module.exports = connectDB;
