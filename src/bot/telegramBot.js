require("dotenv").config();

const { Telegraf } = require("telegraf");

const { extractVideoId } = require("../utils/youtubeUtils");
const { fetchTranscript } = require("../services/transcriptService");
const { generateSummary } = require("../services/summarizerService");
const { answerQuestion } = require("../services/qaService");
const { translate } = require("../services/languageService");

const { generateActionPoints } = require("../services/actionService");
const { generateDeepDive } = require("../services/deepDiveService");

const { escapeMarkdown } = require("../utils/telegramFormatter");

const { getCached, setCached } = require("../storage/cacheStore");

const {
  getSession,
  setSession,
  updateSession,
} = require("../storage/sessionStore");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ============================
// START COMMAND
// ============================
bot.start(async (ctx) => {
  await ctx.reply(
    "👋 Welcome!\n\nSend a YouTube link to generate a structured summary.\n\nCommands:\n/actionpoints\n/deepdive\n/language english | kannada"
  );
});

// ============================
// LANGUAGE COMMAND
// ============================
bot.command("language", async (ctx) => {
  const lang = ctx.message.text.split(" ")[1]?.toLowerCase();

  if (!lang) {
    return ctx.reply("Usage:\n/language english\n/language kannada");
  }

  updateSession(ctx.chat.id, { language: lang });

  await ctx.reply(`🌐 Responses will now be in ${lang}`);
});

// ============================
// ACTION POINTS
// ============================
bot.command("actionpoints", async (ctx) => {
  const session = getSession(ctx.chat.id);

  if (!session || !session.transcriptChunks) {
    return ctx.reply("Please send a YouTube link first.");
  }

  await ctx.reply("📌 Generating action points...");

  (async () => {
    try {
      const result = await generateActionPoints(session.transcriptChunks);

      const translated = await translate(
        result,
        session.language || "english"
      );

      await ctx.reply(
        escapeMarkdown(translated),
        { parse_mode: "Markdown", disable_web_page_preview: true }
      );

    } catch (err) {
      console.error("ACTIONPOINTS ERROR:", err);
      await ctx.reply("❌ Failed to generate action points.");
    }
  })();
});

// ============================
// DEEP DIVE
// ============================
bot.command("deepdive", async (ctx) => {
  const session = getSession(ctx.chat.id);

  if (!session || !session.transcriptChunks) {
    return ctx.reply("Please send a YouTube link first.");
  }

  await ctx.reply("🔎 Generating deep explanation...");

  (async () => {
    try {
      const result = await generateDeepDive(session.transcriptChunks);

      const translated = await translate(
        result,
        session.language || "english"
      );

      await ctx.reply(
        escapeMarkdown(translated),
        { parse_mode: "Markdown", disable_web_page_preview: true }
      );

    } catch (err) {
      console.error("DEEPDIVE ERROR:", err);
      await ctx.reply("❌ Failed to generate deep explanation.");
    }
  })();
});

// ============================
// MAIN TEXT HANDLER
// ============================
bot.on("text", async (ctx) => {

  const text = ctx.message.text;
  const chatId = ctx.chat.id;

  // ---------- YOUTUBE LINK ----------
  if (text.includes("youtube.com") || text.includes("youtu.be")) {

    await ctx.reply("📥 Processing video...\nThis may take up to 1 minute.");

    processVideo(text, chatId, ctx).catch((err) => {
      console.error("VIDEO PROCESS ERROR:", err);
      ctx.reply("❌ Failed to process video.");
    });

    return;
  }

  // ---------- Q&A ----------
  const session = getSession(chatId);

  if (!session || !session.transcriptChunks) {
    return ctx.reply("Please send a YouTube link first.");
  }

  await ctx.reply("🤔 Thinking...");

  (async () => {
    try {

      const answer = await answerQuestion(
        text,
        session.transcriptChunks
      );

      const shortAnswer = answer.slice(0, 1000);

      const translated = await translate(
        shortAnswer,
        session.language || "english"
      );

      await ctx.reply(
        escapeMarkdown(translated),
        { parse_mode: "Markdown", disable_web_page_preview: true }
      );

    } catch (err) {
      console.error("QA ERROR:", err);
      await ctx.reply("❌ Failed to answer question.");
    }
  })();
});

// ============================
// VIDEO PROCESSING
// ============================
async function processVideo(url, chatId, ctx) {

  const videoId = extractVideoId(url);

  if (!videoId) {
    return ctx.reply("❌ Invalid YouTube URL.");
  }

  const existing = getSession(chatId);
  const currentLanguage = existing?.language || "english";

  // ---------- CACHE CHECK ----------
  const cached = getCached(videoId);

  if (cached) {

    await ctx.reply("⚡ Using cached summary.");

    setSession(chatId, {
      transcriptChunks: cached.chunks,
      language: currentLanguage,
    });

    const translated = await translate(
      cached.summary,
      currentLanguage
    );

    return ctx.reply(
      escapeMarkdown(translated),
      { parse_mode: "Markdown", disable_web_page_preview: true }
    );
  }

  // ---------- FETCH TRANSCRIPT ----------
  const transcriptData = await fetchTranscript(videoId);

  if (!transcriptData || transcriptData.length === 0) {
    return ctx.reply("❌ Transcript not available for this video.");
  }

  // ---------- CHUNKING ----------
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

  // ---------- SUMMARY ----------
  const fullText = transcriptData
  .map(t => {
    const minutes = Math.floor(t.start / 60);
    const seconds = Math.floor(t.start % 60)
      .toString()
      .padStart(2, "0");

    return `[${minutes}:${seconds}] ${t.text}`;
  })
  .join("\n");

  const summary = await generateSummary(fullText);

  // ---------- CACHE ----------
  setCached(videoId, {
    summary,
    chunks,
  });

  // ---------- SESSION ----------
  setSession(chatId, {
    transcriptChunks: chunks,
    language: currentLanguage,
  });

  const translated = await translate(summary, currentLanguage);

  await ctx.reply(
    escapeMarkdown(translated),
    { parse_mode: "Markdown", disable_web_page_preview: true }
  );
}

module.exports = bot;