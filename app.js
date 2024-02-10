require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo")(session);
const createError = require("http-errors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const Category = require("./models/category");
const connectDB = require("./config/db");
const indexRouter = require("./routes/index");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/user");
const pagesRouter = require("./routes/pages");

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 60 * 1000 * 60 * 3 },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Global variables across routes
app.use(async (req, res, next) => {
  try {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
    const categories = await Category.find({}).sort({ title: 1 }).exec();
    res.locals.categories = categories;
    next();
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Breadcrumbs middleware
app.use(function (req, res, next) {
  req.breadcrumbs = getBreadcrumbs(req.originalUrl);
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/products", productsRouter);
app.use("/user", usersRouter);
app.use("/pages", pagesRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Function to get breadcrumbs
function getBreadcrumbs(url) {
  const rtn = [{ name: "Home", url: "/" }];
  let acc = "";
  const arr = url.substring(1).split("/");
  for (let i = 0; i < arr.length; i++) {
    acc = i !== arr.length - 1 ? acc + "/" + arr[i] : null;
    rtn[i + 1] = {
      name: arr[i].charAt(0).toUpperCase() + arr[i].slice(1),
      url: acc,
    };
  }
  return rtn;
}
//Moved all required modules to the top.
//Used ES6 syntax for variable declaration (const and let).
//Combined middleware setup for express-session, passport, and flash.
//Consolidated routes setup.
//Removed unnecessary logging and error handling middleware.
//getBreadcrumbs defined it outside the middleware stack for you know better clarification
// and also i have Set the server to listen for requests after all configurations are complete
//hope you liked the changes :))
