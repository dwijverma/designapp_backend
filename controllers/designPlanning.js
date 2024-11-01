const planningModel = require("../services/geminiService.js");

const conversationHistory = [];

const designPlanning = async (req) => {
  const { description } = req.body;
  let prompt = `
   this is the project desciption - ${description}
Generate a JSON structure for a mind map. generate 3-5 research parameters, if something too good do not hesitate to exceed the limit(make sure you dont generate chilren of research parameters).
use a suitable project name.
The root node should be the project name, and it should have various sub-nodes representing different research parameters or components. 
dont include any special characters or new line tags i need to parse the output in json to display in my frontend dynmically.
Each node should have an id, label, make maximum 7 minimum 3 research parameters only research parameters no sub node for research parameters. Here's the JSON schema:

{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "label": { "type": "string" },
    "children": { 
      "type": "array", 
      "items": { "$ref": "#" } 
    }
  }
}

Example:
{
  "id": "1",
  "label": "project-name",
  "children": [
    {
      "id": "2",
      "label": "research-parameter 1",
      
    },
    {
      "id": "4",
      "label": "research-parameter 2"
    }
  ]
}
  here is the test case i am using in my front end right now - 
  mindMapData = response from model
  const mindMapData = {
      id: "1",
      label: "Parent Node",
      children: [
        {
          id: "2",
          label: "Child 1",
          children: [
            {
              id: "3",
              label: "Grandchild 1",
            },
          ],
        },
        {
          id: "4",
          label: "Child 2",
        },
      ],
    };
`;

  let result = await planningModel.generateContent(prompt);
  let mindMapData = result.response.text();
  conversationHistory.push({ prompt: description, response: mindMapData });
  console.log(mindMapData);
  return mindMapData;
};
const allResponses = (conversation) => {
  const allResponsesArr = [];
  conversation.forEach((el) => {
    allResponsesArr.push(
      "desription- " + el.prompt + " our response - " + el.response
    );
  });
  return allResponsesArr.join(" ");
};
const history = allResponses(conversationHistory);

(module.exports = designPlanning), history;
