const express = require("express");
const router = express.Router();
const fontGeneration = require("../controllers/fontGeneration.js");
const FontCollection = require("../models/fontCollection.model.js");
const User = require("../models/user.model.js");

router.post("/generate-fonts", async (req, res) => {
  const msg = await fontGeneration(req);
  // console.log(msg)

  res.status(200).json({ fonts: msg });
});

router.post("/generate-fonts/save", async (req, res) => {
  console.log("font collection route reached");
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
      await FontCollection.deleteMany({ userId: user._id });

      // Clear user's colorCollections array
      user.fontCollections = [];

      // Use for...of loop to save new collections and update user's colorCollections array
      for (const collection of collections) {
        const fontCollection = new FontCollection({
          userId: user._id,
          collectionid: collection.collectionid,
          name: collection.name,
          fontPairs: collection.fontPairs,
        });

        // Save each new collection
        await fontCollection.save();

        // Push the new collection's ID to the user's colorCollections array
        user.fontCollections.push(fontCollection._id);
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

module.exports = router;
