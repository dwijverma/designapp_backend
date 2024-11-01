const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePicture: String,
    // projectPlanning: {type: mongoose.Schema.Types.ObjectId,
    //     ref: "Project Planning",
    // },
    designCritique: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Critique History",
      },
    ],
    colorCollections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color Collections",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
