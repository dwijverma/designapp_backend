// routes/auth.js
const express = require("express");
const passport = require("passport");
const User = require("../models/user.model.js");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/");
  }
);

router.get("/user", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      // If the user is authenticated, find the user in the database
      let user = await User.findOne({ googleId: req.user.id }).populate(
        "colorCollections"
      );

      if (user) {
        // User already exists, return the populated user data
        console.log("User exists: ", user);
        return res.json(user);
      } else {
        // User does not exist, create a new user
        user = new User({
          googleId: req.user._json.sub,
          name: req.user._json.name,
          email: req.user._json.email,
          profilePicture: req.user._json.picture,
          designCritique: [],
          colorCollections: [],
        });

        await user.save();
        console.log("New user created: ", user);
        return res.json(user);
      }
    } else {
      // If the user is not authenticated, return a 401 error
      return res.status(401).json({ error: "Not authenticated" });
    }
  } catch (error) {
    console.log("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
