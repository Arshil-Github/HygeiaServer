require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const bodyParser = require("body-parser");
const { apiKey, personalityPrompt } = require("./serverData");
const cors = require("cors"); // Import cors

const app = express();
app.use(cors()); // Use CORS middleware
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

let chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {
          text: personalityPrompt,
        },
      ],
    },
  ],
});

app.post("/getResponse", async (req, res) => {
  let userResponse = req.body.userMessage;
  console.log(userResponse);
  let result = await chatSession.sendMessage(userResponse);

  //Check if text() fits in the json

  try {
    let resultText = JSON.parse(result.response.text()).response;

    console.log(resultText);

    //res.status(200).send(userResponse)
    res.status(200).send({
      result: resultText,
    });
  } catch (e) {
    console.log(e);

    res.status(200).send({
      response:
        "There seems to be some error in the AI Hospital. Kindly reload or restart.",
    });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
