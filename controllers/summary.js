const planningModel = require("../services/geminiService.js");
const history = require("./designPlanning.js");
const fetchImages = require("../services/fetchImages.js"); // Import the fetchImages function

console.log("history", " ", history);

const generateResearch = async (req) => {
  const { description, parameters } = req.body;
  const researchParameters = parameters;

  let prompt = `
    We are helping a user with design planning. Here is what we have done so far:
    1. We asked the user what they are making today and generated 5-7 research parameters for the description.
    2. The user may have changed the parameters or is asking for research on the same parameters. Based on the description and history provided, start the research for the parameters.
    3. Generate the research content in 50-100 words for each parameter the user wants and return it in JSON format.
    4. Additionally, generate keywords related to the overall mood of the project for image search.

    Note: The history is only for comparison, and research should be done on the latest parameters available.

    This is the history till now: ${history}, and this is the latest details:
    - Description: ${description}
    - Parameters: ${researchParameters
      .map((parameter) => `\n"${parameter}": "some text can be 50 - 100 words"`)
      .join("")}

    Task: Generate research content and keywords for image search (keywords should reflect the overall mood of the project).

    Here's the JSON schema:
    {
      "type": "object",
      "properties": {
        "projectName": { "type": "string" },
        "research parameter": { "type": "string" },
        "keywords": { "type": "array", "items": { "type": "string" } }
      }
    }

    Example output:
    {
      "projectName": "Web App Ad",
      "Target Audience Research": "some text can be 50 - 100 words",
      "Competitor Analysis": "some text can be 50 - 100 words",
      "Headphone Features & Benefits": "some text can be 50 - 100 words",
      "keywords": ["modern", "innovative", "technology", "sleek"]
    }
  `;

  let result = await planningModel.generateContent(prompt);
  let researchDataString = await result.response.text();
  researchDataString = researchDataString.replace(/```json\n|\n```|\n/g, ""); // Remove the markdown syntax

  let researchData;
  try {
    researchData = JSON.parse(researchDataString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return { error: "Failed to parse research data" };
  }

  const projectMoodKeywords = researchData.keywords;
  const images = await fetchImages(projectMoodKeywords); // Fetch images from Pexels API

  return { researchData, images };
};

module.exports = generateResearch;
