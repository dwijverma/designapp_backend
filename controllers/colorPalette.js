const model = require("../services/geminiService.js");

// async function run() {
//   // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

//   const prompt = "Write a story about a magic backpack."

//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   const text = response.text();
//   console.log(text);
// }

// run();
// example return -
// { colors: ['#ff0000', '#00ff00', '#0000ff'] },
//     { colors: ['#ff9900', '#66ff33', '#3399ff'] },

// function createArrayFromString(str) {
//   const regex = /(\d+): \[(.*?)\]/g;
//   const matches = str.matchAll(regex);

//   const result = Array.from(matches, (match) => ({
//     [match[1]]: match[2].split(",").map((color) => color.trim()),
//   }));

//   return Object.assign({}, ...result);
// }

const createColorPalette = async (req) => {
  const { description } = req.body;
  const prompt = `Generate a color palette of 7 colors for this description - ${description}. 
    generate only color codes nothing else, generate 5 palette of 7 colors.the output will require parsing later so 
    return output in such a way that it is in single line without any /n or any special charaters. 
    example return - 
    ( 1: ['#ff0000', '#00ff00', '#0000ff'],
    2: ['#ff9900', '#66ff33', '#3399ff'] )`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().replace(/```json\n|\n```|\n/g, "");
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
  // console.log("this is data", data);
  return data;
};

module.exports = createColorPalette;
