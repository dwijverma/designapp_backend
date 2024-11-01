const CritiqueHistory = require("../models/critique.model.js");
const User = require("../models/user.model.js");
const model = require("../services/geminiService.js");
const fs = require("fs");
const uploadOnCloudinary = require("../services/cloudinary.js");

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

//function to turn analysis into text for further follow-up
const analysisToText = (obj) => {
  const scores = Object.entries(obj["Score"])
    .map((el) => `${el[0]} : ${el[1]}`)
    .join("\n");
  const insight = Object.entries(obj["Detailed Feedback"])
    .map((el) => `${el[0]} : ${el[1]}`)
    .join("\n");
  const text = `Scores - 
    (${scores}),
    
    Detailed Feedback - 
    (${insight})`;
  return text;
};

const followUp = async (req) => {
  const design = req.file;
  const file = fileToGenerativePart(design.path, design.mimetype);
  //   console.log(req.body);
  const { followUpNumber, id } = req.body;
  console.log("found followUp number and id", followUpNumber, id);
  //to find the former critique data -
  try {
    const formerAnalysis = await CritiqueHistory.findOne({ _id: id });
    console.log("data recieved from database", formerAnalysis);

    //check for initial followUp
    let formerCritique;
    if (formerAnalysis.followUp.length === 0) {
      formerCritique = analysisToText(formerAnalysis.analysis);
    } else {
      formerCritique = analysisToText(
        formerAnalysis.followUp.slice(-1)[0].analysis
      );
    }
    console.log(typeof formerCritique);

    const prompt = `Objective:
This is a follow-up critique for the design previously reviewed. 
Please compare the new design with the previous critique and highlight improvements, regressions, and new areas for feedback. 
Focus on specific design principles like layout, typography, color harmony, alignment, and visual impact.

Previous design Analysis - ${formerCritique}

Evaluation Criteria:
1. Layout:
Has the layout improved based on the previous feedback?
Are the alignment and positioning of elements more balanced and visually appealing?

2. Typography:
Has the legibility of the text improved?
Are font choices more harmonious with the overall design?

3. Color Harmony:
Are the colors now better balanced, creating a more pleasing aesthetic?
Is the contrast improved?

4. Alignment:
Has the consistency and spacing between elements improved?

5. Visual Impact:
Does the new design have a stronger or weaker visual impact than the previous one?
Are there any new visual issues introduced?

Output Format:
Score each category out of 100, indicating whether the new design has improved or not.
Provide detailed feedback on each design principle (layout, typography, color harmony, alignment, visual impact), comparing the old and new designs.
Highlight any new issues found in the new design.
Suggest any improvements for further follow-up.

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
    const newFollowUpNumber = followUpNumber + 1;
    const followUpData = {
      followUpNumber: newFollowUpNumber,
      image: image,
      analysis: data,
    };

    formerAnalysis.followUp.push(followUpData);
    await formerAnalysis.save();
    console.log(formerAnalysis);
    data.followUpNumber = newFollowUpNumber;
    data.idForFollowUp = formerAnalysis._id;
    return data;
  } catch (error) {
    console.log(error);
  }

  //to add the follow up in the model -
  //follow up schema -
  //   {
  //     followUpNumber: Number,
  //     image: String,
  //     analysis: Object,
  //   },
};
module.exports = followUp;
