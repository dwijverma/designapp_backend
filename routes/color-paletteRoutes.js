const express = require("express");
const router = express.Router();

const createColorPalette = require("../controllers/colorPalette.js");
const ColorCollection = require("../models/colorCollection.model.js");
const User = require("../models/user.model.js");

router.post("/", async (req, res) => {
  const output = await createColorPalette(req);
  // console.log(output);
  const colorArr = output;
  res.status(200).json({ colors: colorArr });
});

router.post("/save", async (req, res) => {
  console.log("collection route reached");
  const { collections } = req.body;
  // console.log(collections);

  if (req.isAuthenticated()) {
    try {
      // Find the user
      const user = await User.findOne({ googleId: req.user._json.sub });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove all existing collections of the user
      await ColorCollection.deleteMany({ userId: user._id });

      // Clear user's colorCollections array
      user.colorCollections = [];
      console.log("thi sfjaowfjoebf", collections);

      // Use for...of loop to save new collections and update user's colorCollections array
      for (const collection of collections) {
        const colorCollection = new ColorCollection({
          userId: user._id,
          id: collection.id,
          name: collection.name,
          colorPalettes: collection.colorPalettes,
        });

        // Save each new collection
        await colorCollection.save();

        // Push the new collection's ID to the user's colorCollections array
        user.colorCollections.push(colorCollection._id);
      }

      // Save the updated user
      await user.save();

      res
        .status(200)
        .json({ message: "Collections overwritten successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    console.log("req was not authenticated");
    res.status(401).json({ message: "Unauthorized" });
  }
});

router.post("/history", async (req, res) => {
  //this route will return the history of color palette colections created by user
  //
  if (req.isAuthenticated()) {
    const colorPaletteHistory = ColorPaletteHistory
      .findOne
      //find using collection name
      ();
  }
});

module.exports = router;
