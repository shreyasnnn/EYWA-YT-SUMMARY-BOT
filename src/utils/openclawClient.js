const axios = require("axios");
const { MODEL, OLLAMA_URL } = require("../config/aiConfig");

async function runOpenClaw(prompt) {
  try {
    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: MODEL,
      prompt: prompt,
      stream: false,
    });

    return res.data.response;
  } catch (err) {
    console.error("LLM ERROR:", err.message);
    throw err;
  }
}

module.exports = { runOpenClaw };