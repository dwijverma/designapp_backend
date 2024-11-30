const express = require("express");
const router = express.Router();
const critique = require("../controllers/critique.js");
const upload = require("../middlewares/multer.middleware.js");
const followUp = require("../controllers/followUp.js");
const User = require("../models/user.model.js");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const CritiqueHistory = require("../models/critique.model.js");
const { deleteImage } = require("../services/cloudinary.js");

router.post("/", upload.single("design"), async (req, res) => {
  try {
    const output = await critique(req);
    res.status(200).json({ critique: output });
  } catch (error) {
    console.log(error);
  }
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
      const history = await user.populate("designCritique");
      //   console.log("this is history route: ",history.designCritique)
      res.status(200).json({ history: history.designCritique });
    }
  } catch (error) {
    console.log("error at /history route: ", error);
  }
});

router.post("/delete", async (req, res) => {
  const project = req.body;
  console.log(req.user);
  const userFound = await User.findOne({ googleId: req.user._json.sub });
  console.log("this is the user          ", userFound);
  if (req.isAuthenticated) {
    try {
      // Safely convert to ObjectId
      const objectId = mongoose.Types.ObjectId.isValid(project._id)
        ? new mongoose.Types.ObjectId(project._id)
        : null;

      const userID = mongoose.Types.ObjectId.isValid(userFound._id)
        ? new mongoose.Types.ObjectId(userFound._id)
        : null;

      if (!objectId) {
        return res.status(400).json({ message: "Invalid ObjectId format" });
      }

      if (!userID) {
        return res.status(400).json({ message: "Invalid userID format" });
      }
      try {
        await deleteImage(String(project.imageID));
        project.followUp.length > 0 &&
          (await project.followUp.map((project) =>
            deleteImage(String(project.imageID))
          ));
      } catch (error) {
        console.log(error);
      }

      const result2 = await User.findByIdAndUpdate(
        userID,
        { $pull: { designCritique: objectId } },
        { new: true }
      );

      if (!result2) {
        console.error("Failed to update user", result2);
      } else {
        console.log("Updated User:", result2);
      }
      const result = await CritiqueHistory.deleteOne({ _id: objectId });

      if (result.deletedCount === 1) {
        console.log("Delete success");
        res.status(200).json({ message: "Delete successful" });
      } else {
        console.log("No matching document found");
        res.status(404).json({ message: "No matching document found" });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Error deleting document" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

module.exports = router;
