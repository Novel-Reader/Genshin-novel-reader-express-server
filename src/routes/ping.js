const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("pong");
});

router.post("/", function (req, res, next) {
  res.send("pong");
});

module.exports = router;
