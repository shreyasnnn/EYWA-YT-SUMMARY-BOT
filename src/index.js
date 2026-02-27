require("dotenv").config();

const express = require("express");
const bot = require("./bot/telegramBot");

const app = express();

bot.launch()
  .then(() => {
    console.log("Telegram bot running...");
  })
  .catch((err) => {
    console.error("Bot launch error:", err);
  });

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});