const express = require("express");
const router = express.Router();
const critique = require("../controllers/critique.js");
const upload = require("../middlewares/multer.middleware.js");
const followUp = require("../controllers/followUp.js");
const User = require("../models/user.model.js");
const mongoose = require('mongoose');


router.post("/", upload.single("design"), async (req, res) => {
  const output = await critique(req);
  // console.log(output);
  res.status(200).json({ critique: output });
});

router.post("/follow-up", upload.single("design"), async (req, res) => {
  const output = await followUp(req);
  console.log("thghis is the follow up route", output);
  res.status(200).json({ newData: output });
});

router.get("/history", async (req, res) => {
  //req comes from user
  //need to return the design critique history array
  try {
    if (req.isAuthenticated()) {
      const user = await User.findOne({ googleId: req.user._json.sub });
      const history = await user.populate("designCritique")
    //   console.log("this is history route: ",history.designCritique)
      res.status(200).json({history: history.designCritique})
    }
  } catch (error) {
    console.log("error at /history route: ",error)
  }
});

module.exports = router;
