var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const adminRouter = require("./routes/adminRouter");
const usersRouter = require("./routes/usersRouter");
const employeeRouter = require("./routes/employeeRouter");
const authRouter = require("./routes/authRouter");
const ordersRouter = require("./routes/ordersRouter");
const productsRouter = require("./routes/productsRouter");
const addressesRouter = require("./routes/addressRouter");
const cartRouter = require("./routes/cartRouter");
const categoryRouter = require("./routes/categoryRouter");
const reviewRouter = require("./routes/reviewRouter");
const notificationsRouter = require("./routes/notificationRouter");
const voucherRouter = require("./routes/voucherRouter");
const advertisingRouter = require("./routes/adversitingRouter");
const messageRouter = require("./routes/messageRouter");
const paymentRouter = require("./routes/paymentRouter");
const sizeRouter = require("./routes/sizeRouter");
const brandRouter = require("./routes/brandRouter");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

const mongooseURL = process.env.MONGODB_URI;
mongoose
  .connect(mongooseURL)
  .then(() => console.log("Connect to mongodb success.."))
  .catch((error) => console.error("Error connecting to database...", error));

app.use("/admins", adminRouter);
app.use("/users", usersRouter);
app.use("/employees", employeeRouter);
app.use("/auth", authRouter);
app.use("/orders", ordersRouter);
app.use("/products", productsRouter);
app.use("/addresses", addressesRouter);
app.use("/cart", cartRouter);
app.use("/categories", categoryRouter);
app.use("/vouchers", voucherRouter);
app.use("/reviews", reviewRouter);
app.use("/notifications", notificationsRouter);
app.use("/advertising", advertisingRouter);
app.use("/messages", messageRouter);
app.use("/payment", paymentRouter);
app.use("/sizes", sizeRouter);
app.use("/brands", brandRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
