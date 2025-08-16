const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

router.get("/quiz", (req, res) => {
  const week = parseInt(req.query.week, 10);
  const dbPath = path.join(__dirname, "../db.json");
  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  const questions = db.questions.filter((q) => q.week === week);
  res.json({ questions });
});

module.exports = router;
