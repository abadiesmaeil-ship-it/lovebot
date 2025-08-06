const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
console.log("🤖 ربات تلگرام شروع به کار کرد...");

const userStates = new Map(); // ذخیره وضعیت کاربران

// پیام‌های چندزبانه
const messages = {
  fa: {
    welcome: 'سلام عزیزم! زبانتو انتخاب کن:',
    chooseLang: 'زبانتو انتخاب کن:',
    askLink: 'لینک دعوت پارتنرت رو برام بفرست 💞',
    askQ1: 'چقدر از رابطه‌تون راضی هستی؟',
    optionsQ1: ['خیلی زیاد 💖', 'نسبتاً خوب 😊', 'معلوم نیست 🤔'],
    thanks: 'مرسی از پاسخ‌هات! 🎉',
  },
  ar: {
    welcome: 'مرحباً عزيزي! اختر لغتك:',
    chooseLang: 'اختر لغتك:',
    askLink: 'أرسل رابط شريكك 💞',
    askQ1: 'ما مدى رضاك عن علاقتك؟',
    optionsQ1: ['راضٍ جداً 💖', 'جيد إلى حد ما 😊', 'غير متأكد 🤔'],
    thanks: 'شكراً لإجاباتك! 🎉',
  }
};

// شروع تعامل
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userStates.set(chatId, {});

  bot.sendMessage(chatId, messages.fa.chooseLang, {
    reply_markup: {
      keyboard: [['فارسی 🇮🇷', 'عربی 🇸🇦']],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// هندل انتخاب زبان
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();
  const state = userStates.get(chatId) || {};

  if (!state.lang && (text.includes('فارسی') || text.includes('عربی'))) {
    const lang = text.includes('فارسی') ? 'fa' : 'ar';
    state.lang = lang;
    userStates.set(chatId, state);

    bot.sendMessage(chatId, messages[lang].askLink);
    return;
  }

  // مرحله: دریافت لینک
  if (state.lang && !state.partnerLink && text.startsWith('http')) {
    state.partnerLink = text;
    userStates.set(chatId, state);

    bot.sendMessage(chatId, messages[state.lang].askQ1, {
      reply_markup: {
        keyboard: [messages[state.lang].optionsQ1],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
    return;
  }

  // مرحله: پاسخ به سوال اول
  if (state.partnerLink && !state.q1) {
    state.q1 = text;
    userStates.set(chatId, state);

    bot.sendMessage(chatId, messages[state.lang].thanks);
    // در ادامه می‌تونی سوالات بیشتر اضافه کنی...
  }
});
