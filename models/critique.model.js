const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema(
  {
    followUpNumber: Number,
    image: String,
    analysis: Object,
  },
  { timestamps: true }
);

const critiqueHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    projectName: String,
    image: String,
    analysis: Object,
    followUp: [followUpSchema],
  },
  { timestamps: true }
);

const CritiqueHistory = mongoose.model(
  "Critique History",
  critiqueHistorySchema
);

module.exports = CritiqueHistory;
