const { runOpenClaw } = require("../utils/openclawClient");

async function generateSummary(transcript) {

  const prompt = `
You are generating a PREMIUM TELEGRAM REPORT.

You MUST follow this structure EXACTLY.

FORMAT RULES (MANDATORY):

1. Start with:
🎥 **VIDEO SUMMARY**

2. Insert this divider EXACTLY between sections:
▬▬▬▬▬▬▬▬▬▬▬▬▬▬

3. Sections (in order):

🎥 **VIDEO TITLE**
📌 **KEY INSIGHTS**
⏱ **IMPORTANT MOMENTS**
🧠 **CORE TAKEAWAY**

4. Use 🔹 for bullet points.
5. Extract 3–5 timestamps in MM:SS format.
6. Bold important keywords.
7. Add double line breaks between sections.
8. Final takeaway must be:

> 🧠 **Core Takeaway:** sentence here.

9. NO introduction text.
10. NO conclusion text.
11. DO NOT add recommendations.

Transcript:
${transcript}

Generate report now:
`;

  return await runOpenClaw(prompt);
}

module.exports = { generateSummary };