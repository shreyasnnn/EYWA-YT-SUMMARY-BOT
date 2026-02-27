const { runOpenClaw } = require("../utils/openclawClient");

async function generateDeepDive(transcriptChunks) {

  const context = transcriptChunks.slice(0, 5).join("\n\n");

  const prompt = `
You are an AI tutor.

Using the transcript context below, explain the topic clearly and in depth.

RULES:
- Structured explanation
- Use headings
- Beginner-friendly
- No repetition
- No roleplay

Transcript Context:
${context}

Deep Explanation:
`;

  return await runOpenClaw(prompt);
}

module.exports = { generateDeepDive };