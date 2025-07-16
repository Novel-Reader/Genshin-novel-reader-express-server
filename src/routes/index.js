const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", { title: "Genshin novel reader" });
});

router.post("/", function (req, res, next) {
  res.render("index", { title: "Genshin novel reader" });
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.get("/register", function (req, res, next) {
  res.render("register");
});

router.get("/logout", function (req, res, next) {
  res.render("logout");
});

router.get("/static-novel", function (req, res, next) {
  res.render("static-novel");
});

module.exports = router;
