require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function preserveFormatting(original, translated) {
  const originalLines = original.split("\n");
  const translatedLines = translated.split("\n");

  // If model collapsed structure, attempt recovery
  if (translatedLines.length < originalLines.length / 2) {
    return translated.replace(/\. /g, ".\n");
  }

  return translated;
}

function cleanOutput(text) {
  if (!text) return text;

  let cleaned = text;

  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");

  // Extract inside <TEXT> if model echoes
  const match = cleaned.match(/<TEXT>([\s\S]*?)<\/TEXT>/i);
  if (match) {
    cleaned = match[1];
  }

  // Remove explanation patterns
  cleaned = cleaned
    .replace(/The most common.*\n?/gi, "")
    .replace(/You can also use.*\n?/gi, "")
    .replace(/Both are widely.*\n?/gi, "")
    .replace(/Here is the translation.*\n?/gi, "")
    .replace(/Note:.*$/gi, "")
    .trim();

  return cleaned;
}

async function geminiTranslate(text, language) {
  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are a professional translator.

Translate ONLY the language of the content inside <TEXT> into ${language}.

STRICT RULES:
- Preserve ALL formatting exactly.
- Keep emojis unchanged.
- Keep bullet points exactly as they are.
- Keep line breaks exactly as they are.
- Keep headings and symbols unchanged.
- DO NOT merge paragraphs.
- ONLY translate sentences.
- No explanations.
- No commentary.

<TEXT>
${text}
</TEXT>
`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
      },
    });

    let output = response.text;

    output = cleanOutput(output);
    output = preserveFormatting(text, output);

    return output;

  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

module.exports = { geminiTranslate };