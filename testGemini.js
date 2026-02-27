require("dotenv").config();
// Use the new SDK import
const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    // Use an active model like gemini-2.5-flash
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: "Translate 'Hello' to Kannada." }] }],
    });

    console.log(response.text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
