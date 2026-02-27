const { Telegraf } = require("telegraf");
const { extractVideoId } = require("../utils/youtubeUtils");
const { fetchTranscript } = require("../services/transcriptService");
const { generateSummary } = require("../services/summarizerService");
const { answerQuestion } = require("../services/qaService");
const { translate } = require("../services/languageService");
const {
  getSession,
  setSession,
  updateSession,
} = require("../storage/sessionStore");

require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// --------------------
// START COMMAND
// --------------------
bot.start(async (ctx) => {
  await ctx.reply(
    "👋 Welcome!\n\nSend a YouTube link to generate a structured summary.\n\nAfter summary, you can ask follow-up questions.",
  );
});

// --------------------
// LANGUAGE COMMAND
// --------------------
bot.command("language", async (ctx) => {
  const lang = ctx.message.text.split(" ")[1]?.toLowerCase();

  if (!lang) {
    return ctx.reply("Usage:\n/language english\n/language kannada");
  }

  updateSession(ctx.chat.id, { language: lang });

  await ctx.reply(`🌐 Responses will now be in ${lang}`);
});

// --------------------
// MAIN TEXT HANDLER
// --------------------
bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const chatId = ctx.chat.id;

  // --------------------
  // YOUTUBE LINK
  // --------------------
  if (text.includes("youtube.com") || text.includes("youtu.be")) {
    await ctx.reply("📥 Processing video...\nThis may take up to 1 minute.");

    processVideo(text, chatId, ctx).catch((err) => {
      console.error("VIDEO PROCESS ERROR:", err);
      ctx.reply("❌ Failed to process video.");
    });

    return;
  }

  // --------------------
  // Q&A
  // --------------------
  const session = getSession(chatId);

  if (!session || !session.transcriptChunks) {
    return ctx.reply("Please send a YouTube link first.");
  }

  await ctx.reply("🤔 Thinking...");

  (async () => {
    try {
      const answer = await answerQuestion(text, session.transcriptChunks);

      const shortAnswer = answer.slice(0, 600); // limit tokens

      const finalAnswer = await translate(shortAnswer, session.language);

      await ctx.reply(finalAnswer);
    } catch (err) {
      console.error("QA ERROR:", err);
      await ctx.reply("❌ Failed to answer question.");
    }
  })();
});

// --------------------
// BACKGROUND VIDEO PROCESSING
// --------------------
async function processVideo(url, chatId, ctx) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    return ctx.reply("❌ Invalid YouTube URL.");
  }

  const transcriptData = await fetchTranscript(videoId);

  if (!transcriptData || transcriptData.length === 0) {
    return ctx.reply("❌ Transcript not available for this video.");
  }

  // -------- CHUNKING (CRITICAL FIX) --------
  const chunkSize = 1200;
  const chunks = [];
  let current = "";

  for (const entry of transcriptData) {
    if (current.length + entry.text.length > chunkSize) {
      chunks.push(current);
      current = "";
    }
    current += entry.text + " ";
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  // -------- SUMMARY USING FULL TEXT --------
  const fullText = transcriptData.map((t) => t.text).join(" ");
  const summary = await generateSummary(fullText);

  // -------- STORE SESSION --------
  const existing = getSession(chatId);

  setSession(chatId, {
    transcriptChunks: chunks,
    language: existing?.language || "english",
  });

  const session = getSession(chatId);

  const finalSummary = await translate(summary, session?.language || "english");

  await ctx.reply(finalSummary);
}

module.exports = bot;
