const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const faMessages = require('./fa.json');
const arMessages = require('./ar.json');

// توکن تلگرام از متغیر محیطی
const token = process.env.BOT_TOKEN;

// ایجاد ربات تلگرام
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram bot started...');

// پیام خوش‌آمد با الهام از داستان تو و عمر
const welcomeMessage = `
🎻 به ربات تحلیل عشق خوش آمدید

این ربات برای عاشق‌ها ساخته شده تا رابطه‌شون رو عمیق‌تر کنن 💞  
مهم نیست کجای دنیا هستید، فقط کافیه همو دوست داشته باشید ❤️  
`;

// ارسال پیام تصادفی عاشقانه
function getRandomLoveLine(lang) {
  const lines = lang === 'fa' ? fs.readFileSync('./fa.txt', 'utf-8').split('\n') : fs.readFileSync('./ar.txt', 'utf-8').split('\n');
  return lines[Math.floor(Math.random() * lines.length)];
}

// پاسخ به پیام‌ها
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase() || '';
  const lang = msg.from.language_code === 'ar' ? 'ar' : 'fa';
  const messages = lang === 'fa' ? faMessages : arMessages;

  if (text.includes('/start')) {
    bot.sendMessage(chatId, welcomeMessage);
  } else if (text.includes('عشق') || text.includes('حب') || text.includes('love')) {
    const quote = getRandomLoveLine(lang);
    bot.sendMessage(chatId, `${messages.loveLine}\n\n${quote}`);
  } else {
    bot.sendMessage(chatId, messages.default);
  }
});
