const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Routes
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const orderRoute = require("./routes/orderRoute");
const reviewRoute = require("./routes/reviewRoute");

//erorr handler
const AppError = require("./utils/appError");
const globalError = require("./controllers/errorController");
const cookieParser = require("cookie-parser");

const app = express();

//Global middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ecommerceapp-wheat.vercel.app",
      "http://localhost:5173",
    ], // النطاق الذي يمكنه الوصول إلى الخادم
    credentials: true, // السماح بإرسال الكريدنشلز مثل الكوكيز
  })
);

//Set Security HTTPS Headers
app.use(helmet()); // من المهم وضعه في بداية التطبيق

//Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Limit Requests from same api
const limiter = rateLimit({
  // limit each IP to 100 requests per hour if requeste> 100 in hour => error message
  max: 3000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour.",
});

app.use("/api", limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" })); // limit: '10kb' ??

//clean data (Data Sanitization) against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XXS
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
app.use("/api/eco/users", userRoute);
app.use("/api/eco/products", productRoute);
app.use("/api/eco/orders", orderRoute);
app.use("/api/eco/reviews", reviewRoute);

app.all("*", (req, res, next) => {
  // إذا قمنا بتمرير قيمة لnext فإنه يعتبرها رسالة خطأ ويقوم بإعدام جميع البرامج الوسيطة
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
//Error Handling Middleware
app.use(globalError);

module.exports = app;
