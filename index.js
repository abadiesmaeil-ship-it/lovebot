require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// توکن از محیط (Render Environment Variable)
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 ربات تلگرام شروع به کار کرد...');

// دیتابیس ساده (حافظه موقت)
const users = {};

// دستور شروع
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const langKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '🇮🇷 فارسی' }, { text: '🇬🇧 English' }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  bot.sendMessage(chatId, '👋 لطفاً زبان خود را انتخاب کنید / Please choose your language:', langKeyboard);
});

// مدیریت پیام‌ها
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // انتخاب زبان
  if (text === '🇮🇷 فارسی') {
    users[chatId] = { lang: 'fa' };
    bot.sendMessage(chatId, `به ربات تحلیل عشق خوش اومدی ❤️\n\nلینک دعوت از عشق‌ت:\nhttps://t.me/Eshgoudsgl_bot?start=${chatId}`);
    return;
  }

  if (text === '🇬🇧 English') {
    users[chatId] = { lang: 'en' };
    bot.sendMessage(chatId, `Welcome to Love Analyzer 💖\n\nInvite your partner using this link:\nhttps://t.me/Eshgoudsgl_bot?start=${chatId}`);
    return;
  }

  // واکنش‌ها بر اساس زبان ذخیره‌شده
  const userLang = users[chatId]?.lang || 'fa';

  if (userLang === 'fa') {
    if (text.includes('دوستم داری')) {
      bot.sendMessage(chatId, 'بیشتر از همه دنیا 💘');
    } else if (text.includes('عشق من')) {
      bot.sendMessage(chatId, 'همیشه کنارتم عشقم 😍');
    } else {
      bot.sendMessage(chatId, 'عزیز دلم، احساس‌تو باهام درمیون بذار 💞');
    }
  } else {
    if (text.toLowerCase().includes('do you love me')) {
      bot.sendMessage(chatId, 'More than anything in the world 💘');
    } else if (text.toLowerCase().includes('my love')) {
      bot.sendMessage(chatId, 'Always by your side 💖');
    } else {
      bot.sendMessage(chatId, 'Tell me your heart 💌');
    }
  }
});
