const { geminiTranslate } = require("../utils/geminiClient");
const { runOpenClaw } = require("../utils/openclawClient");

async function translate(text, language) {

  if (!language || language === "english") {
    return text;
  }

  // Try Gemini first
  if (process.env.USE_GEMINI_TRANSLATION === "true") {
    try {
      return await geminiTranslate(text, language);
    } catch (err) {
      console.log("Gemini failed, falling back to local LLM");
    }
  }

  // Fallback to local Ollama
  const prompt = `
Translate ONLY the language of the content inside <TEXT> into ${language}.

STRICT RULES:
- Preserve ALL formatting exactly.
- Keep bullet points and line breaks unchanged.
- No explanations.
- Return ONLY translated text.

<TEXT>
${text}
</TEXT>
`;

  try {
    return await runOpenClaw(prompt);
  } catch (err) {
    console.error("Local translation failed:", err.message);
    return text; // last fallback
  }
}

module.exports = { translate };