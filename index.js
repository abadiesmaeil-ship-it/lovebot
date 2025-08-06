const TelegramBot = require('node-telegram-bot-api');

// دریافت توکن از Environment Variables
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ توکن ربات پیدا نشد. لطفاً BOT_TOKEN را در Environment Variables تنظیم کنید.");
  process.exit(1);
}

// ایجاد ربات در حالت polling
const bot = new TelegramBot(token, { polling: true });

console.log("🤖 ربات تلگرام شروع به کار کرد...");

// پیام خوش‌آمدگویی برای شروع
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "عزیزم";

  const welcomeMessage = `سلام ${firstName} 🌈\n\nبه ربات تحلیل رابطه خوش اومدی! ❤️\n\nبرای ادامه، فقط کافیه پیام بدی یا از دستورهای زیر استفاده کنی.`;

  bot.sendMessage(chatId, welcomeMessage);
});

// پاسخ به هر پیام متنی
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // جلوگیری از تکرار پاسخ به /start
  if (msg.text.toString().toLowerCase() === '/start') return;

  bot.sendMessage(chatId, `📩 پیامت دریافت شد!\nفعلاً در حال ساخت سیستم تحلیل رابطه هستیم 🛠️`);
});
