const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message ,err);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");
const connectToDb = require("./utils/dbConnect");

connectToDb();

const port = process.env.PORT || 3000;
const server = app;

server.listen(port, () => {
  console.log("app runnig on port:", port);
});
