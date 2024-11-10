const express = require("express");
const router = express.Router();
const fontGeneration = require("../controllers/fontGeneration.js");

router.post("/generate-fonts", async (req, res) => {
  const msg = await fontGeneration(req);
  // console.log(msg)

  res.status(200).json({ fonts: msg });
});

module.exports = router;
