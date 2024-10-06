var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

require("./models/addressModel");
require("./models/brandModel");
require("./models/cartModels");
require("./models/categoryModel");
require("./models/messageModel");
require("./models/notificationModel");
require("./models/orderDetailModel");
require("./models/orderModel");
require("./models/paidHistoryModel");
require("./models/paymentModel");
require("./models/productModel");
require("./models/reviewModel");
require("./models/searchModel");
require("./models/sizeModel");
require("./models/userModel");
require("./models/voucherModel");
require("./models/walletModel");
require("./models/wishlistModel");
require("./models/voucherModel");

var adminRouter = require("./routes/adminRouter");
var usersRouter = require("./routes/usersRouter");
var employeeRouter = require("./routes/employeeRouter");
var authRouter = require("./routes/authRouter");
var ordersRouter = require("./routes/ordersRouter");
var productsRouter = require("./routes/productsRouter");
var addressesRouter = require("./routes/addressRouter");
var cartRouter = require("./routes/cartRouter");
var categoryRouter = require("./routes/categoryRouter");
var reviewRouter = require("./routes/reviewRouter");
var notificationsRouter = require("./routes/notificationRouter");
const voucherRouter = require('./routes/voucherRouter')
const advertisingRouter = require('./routes/adversitingRouter');
const paymentRouter = require('./routes/paymentRouter');
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
app.use('/notifications', notificationsRouter);
app.use('/advertising', advertisingRouter);
app.use('/payment', paymentRouter);

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
