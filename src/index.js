const express = require("express");
const bot = require("./bot/telegramBot");
require("dotenv").config();

const app = express();

bot.launch();
console.log("Telegram bot running...");

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});