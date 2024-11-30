const model = require("../services/geminiService.js");
function createFontArrayFromString(str) {
  const regex = /(\d+): \[(.*?)\]/g;
  const matches = [...str.matchAll(regex)]; // Convert iterator to array
  //   console.log(matches)
  const result = {};
  for (const match of matches) {
    const number = match[1];
    const fonts = match[2].split(",").map((font) => font.trim());
    result[number] = fonts;
  }

  return result;
}

const fontGeneration = async (req) => {
  const { description } = req.body;
//   const prompt = `Suggest 3 unique and trending font pairings (3 fonts each) for the description: ${description}. 
//   Ensure fonts are distinct and suitable for Google Fonts API (e.g., 'Edu Australia VIC WA NT Hand' should be 'Edu AU VIC WA NT'). 
//   Return in a single line without special characters or newlines, like: (1: [font1,font2,font3], 2: [font1,font2,font3]).
//   Schema:
// 1. Font Pairing Count: Provide 3 unique font pairings.
// 2. Fonts per Pairing: Each pairing must consist of 3 distinct fonts.
// 3. Font Source: Ensure all fonts are available in Google Fonts.
// 4. Formatting:
//    Avoid special characters and newlines.
//    Output should be in a single line.
// 5. Format as: (1: [font1, font2, font3], 2: [font1, font2, font3], 3: [font1, font2, font3])
// 6. Font Name Accuracy: Use exact names from Google Fonts, simplifying them when needed (e.g., 'Edu Australia VIC WA NT Hand' becomes 'Edu AU VIC WA NT').
//    Uniqueness: The fonts in each pairing must be distinct from one another and suitable for a variety of project types.
// `;
  const prompt = `generate 3 diffrent combinations of fonts. each combination needs to have 3 fonts that can be used together in a design.
 here is the description of project - ${description}. 
 Ensure fonts are distinct and suitable for Google Fonts API (e.g., 'Edu Australia VIC WA NT Hand' should be 'Edu AU VIC WA NT').
 Font Name Accuracy: Use exact names from Google Fonts, simplifying them when needed (e.g., 'Edu Australia VIC WA NT Hand' becomes 'Edu AU VIC WA NT').
 Uniqueness: The fonts in each pairing must be distinct from one another and suitable for a variety of project types.
 Expected output - {1: [font1, font2, font3], 2: [font1, font2, font3], 3: [font1, font2, font3]}.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log("this is text: ", text);
  // return createFontArrayFromString(text);
  return JSON.parse(text);
};

module.exports = fontGeneration;
