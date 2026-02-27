const { runOpenClaw } = require("../utils/openclawClient");

async function generateSummary(transcriptText) {
  const prompt = `
You are an AI research assistant.

Create a structured summary of the video transcript below.

Include:
- 🎥 Video Title (infer if possible)
- 📌 5 Key Points
- ⏱ Important Timestamps
- 🧠 Core Takeaway

Rules:
- Use only transcript content
- Be concise
- Do not hallucinate

Transcript:
${transcriptText}
`;

  return await runOpenClaw(prompt);
}

module.exports = { generateSummary };