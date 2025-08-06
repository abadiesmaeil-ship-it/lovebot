const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const userLanguages = {}; // { user_id: 'fa' or 'ar' }

const languages = {
  fa: {
    welcome: "لطفاً زبانت رو انتخاب کن 🌍",
    next: "عالیه! حالا لطفاً این لینک رو برای پارتنرت بفرست 👇",
    invite: "🔗 لینک دعوت برای پارتنرم"
  },
  ar: {
    welcome: "يرجى اختيار لغتك 🌍",
    next: "رائع! الآن أرسل هذا الرابط إلى شريكك 👇",
    invite: "🔗 رابط الدعوة لشريكي"
  }
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, `🌍 ${languages.fa.welcome}\n${languages.ar.welcome}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'فارسی 🇮🇷', callback_data: 'lang_fa' }],
        [{ text: 'العربية 🇸🇦', callback_data: 'lang_ar' }]
      ]
    }
  });
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  if (data.startsWith('lang_')) {
    const lang = data.split('_')[1];
    userLanguages[userId] = lang;

    const selectedLang = languages[lang];
    const inviteLink = `https://t.me/${process.env.BOT_USERNAME}?start=partner_${userId}`;

    bot.sendMessage(chatId, selectedLang.next + "\n" + inviteLink);
  }
});
