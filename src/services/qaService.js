const { runOpenClaw } = require("../utils/openclawClient");

// --------------------
// SIMPLE KEYWORD RETRIEVAL
// --------------------
function retrieveRelevantChunks(question, chunks) {
  const keywords = question
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 3);

  const scored = chunks.map((chunk) => {
    let score = 0;

    for (const word of keywords) {
      if (chunk.toLowerCase().includes(word)) {
        score++;
      }
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, 3)
    .map((s) => s.chunk)
    .join("\n\n");
}

// --------------------
// QA FUNCTION
// --------------------
async function answerQuestion(question, transcriptChunks) {

  const context = retrieveRelevantChunks(question, transcriptChunks);

  const prompt = `
You are an AI research assistant answering questions from a YouTube transcript.

STRICT RULES:
- Answer ONLY using the transcript context below.
- If the answer is NOT explicitly mentioned, reply EXACTLY:
"This topic is not covered in the video."
- Do NOT introduce yourself.
- Do NOT roleplay.
- Maximum 4 sentences.
- Clear simple English.
- Concise and factual.

FORMAT RULES:
- Start with 📑 **ANSWER**
- Insert divider: ▬▬▬▬▬▬▬▬▬▬▬▬▬▬
- Use 🔹 bullet points if needed.
- Bold important keywords.

Transcript Context:
${context}

Question:
${question}

Answer:
`;

  const response = await runOpenClaw(prompt);

  return response.trim();
}

module.exports = { answerQuestion };