const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 ربات تلگرام شروع به کار کرد...");

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || "دوست عزیز";

  bot.sendMessage(chatId, `سلام ${name}! 💖\nبه ربات تحلیل عشق خوش اومدی.`);
});
