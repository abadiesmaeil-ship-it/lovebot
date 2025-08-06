require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // پیام شروع
  if (userMessage.toLowerCase() === '/start') {
    bot.sendMessage(chatId, "سلام! 👋\nپیام‌تو بفرست تا نظر هوش مصنوعی رو بگیری 💬");
    return;
  }

  // درحال تایپ...
  bot.sendChatAction(chatId, 'typing');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'تو یک روانشناس و مشاور عاطفی هستی.' },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiReply = response.data.choices[0].message.content.trim();
    bot.sendMessage(chatId, aiReply);
  } catch (error) {
    console.error("خطا در دریافت پاسخ از OpenAI:", error.message);
    bot.sendMessage(chatId, 'مشکلی در ارتباط با هوش مصنوعی به وجود آمد. لطفاً دوباره تلاش کن.');
  }
});
