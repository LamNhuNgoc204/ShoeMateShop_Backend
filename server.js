var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var app = express();

app.use(cors());
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
const messageRouter = require("./routes/messageRouter");
const paymentRouter = require("./routes/paymentRouter");
const sizeRouter = require("./routes/sizeRouter");
const brandRouter = require("./routes/brandRouter");
const filterRouter = require("./routes/filterRouter");
const shipRouter = require("./routes/shipRouter");
const paymentMethodRouter = require("./routes/paymentMethodRouter");
const statsRouter = require("./routes/statsRouter");
const walletRouter = require("./routes/walletRouter");
const recentViewRouter = require("./routes/recentViewRouter");
const { sendNotification } = require("./firebase");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

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
app.use("/messages", messageRouter);
app.use("/payment", paymentRouter);
app.use("/sizes", sizeRouter);
app.use("/brands", brandRouter);
app.use("/filter", filterRouter);
app.use("/ship", shipRouter);
app.use("/payment-method", paymentMethodRouter);
app.use("/stats", statsRouter);

app.use("/wallet", walletRouter);
app.use("/recent-views", recentViewRouter);

app.use("/", (req, res) => {
  res.status(200).json({ msg: "on" });
  console.log("server on...");
});

app.get("/.well-known/assetlinks.json", (req, res) => {
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.bdnteam.mateshoe",
        sha256_cert_fingerprints: [
          "5E:F7:D8:9D:03:43:B7:F0:49:AC:A9:04:A7:3C:17:12:21:26:04:3A:DE:6C:4A:87:24:5D:17:1A:F2:25:B9:38",
        ],
      },
    },
  ]);
});

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

app.listen(() => {
  console.log(`Server is running on http://localhost:3000`);
});

module.exports = app;
