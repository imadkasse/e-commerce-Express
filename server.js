const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");
const connectToDb = require("./utils/dbConnect");

connectToDb();

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log("app runnig on port:", port);
});
