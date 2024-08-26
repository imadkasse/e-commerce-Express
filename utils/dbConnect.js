const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    const db = process.env.DATABASE.replace(
      "<PASSWORD>",
      process.env.DATABASE_PASSWORD
    );
    await mongoose.connect(db);
    console.log("Successfully connected to the database");
  } catch (error) {
    console.error("Error connecting to the database", error);
    process.exit(1);
  }
};
module.exports = connectToDb;
