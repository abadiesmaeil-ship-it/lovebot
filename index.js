require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const responses = {
  fa: {
    welcome: 'سلام 💖 به ربات تحلیل عشق خوش اومدی! لطفاً زبانت رو انتخاب کن.',
    languages: {
      en: '🇺🇸 English',
      fa: '🇮🇷 فارسی'
    },
    default: 'عزیز دلم، احساس‌تو باهام درمیون بذار 💞',
    love: 'آره، دیوونتم 😍 تو عشقی ❤️',
  },
  en: {
    welcome: 'Hi 💖 Welcome to the Love Analyzer Bot! Please choose your language.',
    languages: {
      en: '🇺🇸 English',
      fa: '🇮🇷 Persian'
    },
    default: 'Sweetheart, share your feelings with me 💞',
    love: 'Yes, I love you so much 😍 You are my everything ❤️',
  }
};

const userLang = {}; // to store user's selected language

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const langKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: responses.fa.languages.fa, callback_data: 'lang_fa' },
          { text: responses.fa.languages.en, callback_data: 'lang_en' }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, responses.fa.welcome, langKeyboard);
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const lang = query.data.split('_')[1];
  userLang[chatId] = lang;

  bot.sendMessage(chatId, `زبان شما تنظیم شد به: ${responses[lang].languages[lang]}`);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const lang = userLang[chatId] || 'fa';

  if (text === '/start') return;

  if (/love|دوست|عشق/i.test(text)) {
    bot.sendMessage(chatId, responses[lang].love);
  } else {
    bot.sendMessage(chatId, responses[lang].default);
  }
});
