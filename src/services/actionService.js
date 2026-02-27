const { runOpenClaw } = require("../utils/openclawClient");

async function generateActionPoints(transcriptChunks) {

  const context = transcriptChunks.slice(0, 5).join("\n\n");

  const prompt = `
You are an AI research assistant.

From the transcript context below, extract practical and actionable insights.

RULES:
- Return 5–8 bullet points.
- Each point must be actionable.
- Be concise.
- Do NOT explain.
- Do NOT introduce yourself.

Transcript Context:
${context}

Action Points:
`;

  return await runOpenClaw(prompt);
}

module.exports = { generateActionPoints };