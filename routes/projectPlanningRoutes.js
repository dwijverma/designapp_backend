const express = require("express");
const router = express.Router();
const designPlanning = require("../controllers/designPlanning.js");
const generateResearch = require("../controllers/summary.js");

router.post("/", async (req, res) => {
  const msg = await designPlanning(req);
  console.log(msg);
  res.status(200).json(msg);
});

router.post("/overall-research", async (req, res) => {
  const msg = await generateResearch(req);
  console.log(" this is overall reseatch", msg);
  res.status(200).json(msg);
});

module.exports = router;
