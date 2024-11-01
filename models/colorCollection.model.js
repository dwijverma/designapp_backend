const mongoose = require("mongoose");

const PaletteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  colorValues: { type: [[String]], required: true },
});

const colorCollectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  id: { type: String, required: true },
  name: { type: String, required: true },
  colorPalettes: [PaletteSchema],
});

const ColorCollection = mongoose.model(
  "Color Collections",
  colorCollectionSchema
);

module.exports = ColorCollection;
