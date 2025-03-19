const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Routes
const userRoute = require("./routes/user.routes");
const authRoute = require("./routes/auth.routes");
const productRoute = require("./routes/product.routes");
const orderRoute = require("./routes/order.routes");
const reviewRoute = require("./routes/review.routes");

//erorr handler
const AppError = require("./utils/appError");
const globalError = require("./controllers/error.controller");
// const cookieParser = require("cookie-parser");

const app = express();

//Global middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "https://ecommerceapp-wheat.vercel.app"], // النطاق الذي يمكنه الوصول إلى الخادم
    credentials: true, // السماح بإرسال الكريدنشلز مثل الكوكيز
  })
);

//Set Security HTTPS Headers
app.use(helmet()); // من المهم وضعه في بداية التطبيق

//Development logging
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
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
    whitelist: [ // change the whitelist after time
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/reviews", reviewRoute);

app.all("*", (req, res, next) => {
  // إذا قمنا بتمرير قيمة لnext فإنه يعتبرها رسالة خطأ ويقوم بإعدام جميع البرامج الوسيطة
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalError);

module.exports = app;
