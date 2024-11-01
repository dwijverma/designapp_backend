require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});
const planningModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  // Set the `responseMimeType` to output JSON
  generationConfig: { responseMimeType: "application/json" },
});

(module.exports = model), planningModel;
