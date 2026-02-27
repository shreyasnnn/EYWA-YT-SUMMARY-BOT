function cleanTranslationOutput(text) {
  if (!text) return text;

  let cleaned = text;

  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");

  // Extract content inside <TEXT> if present
  const match = cleaned.match(/<TEXT>([\s\S]*?)<\/TEXT>/i);
  if (match) {
    cleaned = match[1];
  }

  // Remove common unwanted prefixes
  cleaned = cleaned.replace(/Here is the translation.*\n?/gi, "");
  cleaned = cleaned.replace(/Note:.*$/gi, "");

  // Remove leftover tags
  cleaned = cleaned.replace(/<\/?TEXT>/gi, "");

  return cleaned.trim();
}

module.exports = { cleanTranslationOutput };