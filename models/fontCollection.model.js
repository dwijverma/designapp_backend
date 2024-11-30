const mongoose = require("mongoose");

const FontPairSchema = new mongoose.Schema({
  fontPairid: { type: String, required: true },
  fontValues: { type: [String], required: true },
});

const fontCollectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  collectionid: { type: String, required: true },
  name: { type: String, required: true },
  fontPairs: [FontPairSchema],
});

const FontCollection = mongoose.model(
  "Font Collections",
  fontCollectionSchema
);

module.exports = FontCollection;
