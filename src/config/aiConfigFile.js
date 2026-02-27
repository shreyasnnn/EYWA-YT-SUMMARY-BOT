module.exports = {
  MODEL: process.env.LLM_MODEL || "llama3",
  TRANSLATION_MODEL: process.env.TRANSLATION_MODEL || "llama3",
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
};