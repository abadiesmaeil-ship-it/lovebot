const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// اتصال به ربات تلگرام
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// اتصال به OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// نمونه پاسخ ساده به هر پیام متنی
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // پاسخ ساده اولیه
  if (userMessage.toLowerCase() === '/start') {
    return bot.sendMessage(chatId, 'سلام! به ربات زوجین خوش اومدی. 🌹\nدر حال آماده‌سازی سوالات اولیه...');
  }

  // ارسال به OpenAI (در صورت نیاز)
  try {
    const aiResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'تو یک مشاور روابط عاشقانه هستی.' },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
    });

    const reply = aiResponse.data.choices[0].message.content;
    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error('❌ Error with OpenAI:', error.message);
    bot.sendMessage(chatId, 'مشکلی در ارتباط با هوش مصنوعی به وجود آمد. لطفاً دوباره تلاش کن.');
  }
});
