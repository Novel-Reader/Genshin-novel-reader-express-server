const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const errorHandlerMiddleWare = require("./middlewares/error-handler");
const monitorMiddleWare = require("./middlewares/monitor");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// handle POST request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// handle static public import path
app.use(express.static(path.join(__dirname, "public")));

app.use(monitorMiddleWare);

app.use("/", indexRouter);
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandlerMiddleWare);

module.exports = app;
