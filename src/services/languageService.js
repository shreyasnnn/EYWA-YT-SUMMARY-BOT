const axios = require("axios");
const { TRANSLATION_MODEL, OLLAMA_URL } = require("../config/aiConfig");

async function translate(text, language) {

  if (!language || language === "english") {
    return text;
  }

  const prompt = `
Translate ONLY the text inside <TEXT> into natural ${language}.

<TEXT>
${text}
</TEXT>
`;

  const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
    model: TRANSLATION_MODEL,
    prompt,
    stream: false,
  });

  return res.data.response.trim();
}

module.exports = { translate };