const model = require("../services/geminiService.js");
const uploadOnCloudinary = require("../services/cloudinary.js");
const CritiqueHistory = require("../models/critique.model.js");
const User = require("../models/user.model.js");
const fs = require("fs");

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

//function to turn analysis into text for further follow-up

const critique = async (req) => {
  const design = req.file;
  const { projectName, description } = req.body;

  console.log("this is the form data: ", projectName, description);

  const prompt = `
    Design Analysis for Visual Design Principles

Objective:
Perform a comprehensive critique of the provided design, focusing on core visual design principles including layout, typography, color harmony, alignment, and overall composition.

Design Details:

Project Name: ${projectName}
Description: ${description}

Layout & Composition:

Assess the spatial arrangement of elements. Are they balanced? Is there adequate use of white space? Is the design cluttered or clean?
Evaluate the visual hierarchy. Are key elements prominent? Is the flow of information logical and intuitive?
Typography:

Review the font choices. Are they appropriate for the design’s purpose and audience?
Check for readability. Is the text easy to read at different sizes? Is there sufficient contrast between text and background?
Analyze the alignment and spacing of text elements. Are they consistent and visually appealing?
Color Harmony:

Evaluate the color scheme. Does it create a pleasing and cohesive visual experience?
Check for sufficient contrast between background and foreground elements. Are any colors clashing?
Assess the use of colors to highlight important information or guide the viewer’s attention.
Alignment & Spacing:

Analyze the alignment of elements. Are they properly aligned according to design principles (e.g., left-aligned text, centered logos)?
Evaluate the spacing between elements. Is it consistent? Does it contribute to a clean and organized look?
Visual Impact:

Assess the overall visual appeal of the design. Does it effectively communicate the intended message?
Identify areas of improvement for enhancing visual impact. Suggest any changes to improve the design's effectiveness.
Output Format:

Score: Provide a score out of 100 for each category (layout, typography, color harmony, alignment, visual impact).
Detailed Feedback: Offer specific, actionable suggestions for improvement in each category.
Visual Overlay Recommendations: Suggest areas where overlays could be applied to highlight misalignment, poor contrast, or other design issues.
Here is the JSON schema - 
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Design Review",
  "type": "object",
  "properties": {
    "Score": {
      "type": "object",
      "properties": {
        "Layout": { "type": "integer" },
        "Typography": { "type": "integer" },
        "ColorHarmony": { "type": "integer" },
        "Alignment": { "type": "integer" },
        "VisualImpact": { "type": "integer" }
      },
      "required": ["Layout", "Typography", "ColorHarmony", "Alignment", "VisualImpact"]
    },
    "Detailed Feedback": {
      "type": "object",
      "properties": {
        "Layout": { "type": "string" },
        "Typography": { "type": "string" },
        "ColorHarmony": { "type": "string" },
        "Alignment": { "type": "string" },
        "VisualImpact": { "type": "string" }
      },
      "required": ["Layout", "Typography", "ColorHarmony", "Alignment", "VisualImpact"]
    },
    "Visual Overlay Recommendations": {
      "type": "object",
      "properties": {
        "Layout": { "type": "string" },
        "Typography": { "type": "string" },
        "ColorHarmony": { "type": "string" },
        "Alignment": { "type": "string" },
        "VisualImpact": { "type": "string" }
      },
      "required": ["Layout", "Typography", "ColorHarmony", "Alignment", "VisualImpact"]
    }
  },
  "required": ["Score", "Detailed Feedback", "Visual Overlay Recommendations"]
}
  Here is the example output
{
  Score: {
    Layout: 60,
    Typography: 70,
    ColorHarmony: 75,
    Alignment: 65,
    VisualImpact: 65
  },
  'Detailed Feedback': {
    Layout: 'The layout is somewhat balanced, but the white space distribution could be improved. The top card feels cluttered, with the logo taking up too much space. Consider reducing the size of the logo or adding more white space around it to create a cleaner look. The bottom card feels more balanced, but the contact information is not organized well, leading to a bit of visual clutter.',
    Typography: 'The font choices are generally appropriate for a bakery shop card. However, the font size for the contact details is a bit small and could be harder to read. Increase the font size slightly for better readability. The alignment of the text is consistent, but consider aligning the contact details to the left for better readability.',
    ColorHarmony: 'The color scheme is pleasing and cohesive, using warm and earthy tones. The contrast between the background and foreground elements is good. However, consider adding a subtle gradient to the background to make the design more dynamic. Ensure to maintain the sufficient contrast.',
    Alignment: 'The alignment of elements is generally good. However, the contact information on the bottom card is not properly aligned, making it seem a bit messy. Align the contact information elements consistently to the left or right.',
    VisualImpact: 'The design has a clean and modern feel but lacks a certain visual impact. Consider adding a subtle background texture or pattern to add depth and interest. The logo is simple and could be more visually appealing with the use of gradients or shadows. Experiment with different logo styles to find a more engaging visual.'
  },
  'Visual Overlay Recommendations': {
    Layout: 'Overlay the top card to visualize the excessive use of space by the logo and suggest areas for reducing the logo size or adding white space. Overlay the bottom card to highlight the disorganization in the contact information and suggest improvements.',
    Typography: 'Overlay the contact details on the bottom card to emphasize the need for a larger font size. Overlay the text to visualize any misalignment issues and suggest solutions.',
    ColorHarmony: 'Overlay the background of both cards to visualize the potential for a subtle gradient. Overlay specific areas to demonstrate the need for contrast adjustments.',
    Alignment: 'Overlay the bottom card to highlight the misalignment of the contact information and suggest alignment improvements.',
    VisualImpact: 'Overlay both cards to visualize areas where textures or patterns could be added. Overlay the logo to demonstrate improvements with gradients or shadows'
  }
}
`;
  const file = fileToGenerativePart(design.path, design.mimetype);
  try {
    const result = await model.generateContent([prompt, file]);
    const uploadToCloudinary = await uploadOnCloudinary(design.path);
    const designAnalysis = result.response
      .text()
      .replace(/```json\n|\n```|\n/g, "");

    let data;
    try {
      data = JSON.parse(designAnalysis);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    const image = uploadToCloudinary.url;
    data.image = image;

    // const designAnalysisInText = analysisToText(data);

    // console.log("aftfer appending: ", data);
    try {
      if (data && req.isAuthenticated()) {
        //save the critique data in the model
        const user = await User.findOne({ googleId: req.user._json.sub });
        let critiqueHistory = new CritiqueHistory({
          userId: user._id,
          projectName: projectName,
          image: image,
          analysis: data,
          followUp: [],
        });
        await critiqueHistory.save();
        await user.designCritique.push(critiqueHistory._id);
        await user.save();
        console.log("critique history saved successfully: ", critiqueHistory);

        //for followUp functionality-
        data.followUpNumber = 0;
        data.idForFollowUp = critiqueHistory._id;
      } else {
        console.log("critique data was not saved");
      }
    } catch (error) {
      console.log(
        "error during saving the critique history in database: ",
        error
      );
    }
    return data;
  } catch (error) {
    console.log("error retriving the content from gemini model: ", error);
    fs.unlinkSync(design.path);
    return null;
  }
};
module.exports = critique;
