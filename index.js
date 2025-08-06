require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

// اتصال به تلگرام با متغیر loveBot
const loveBot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// اتصال به OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// بارگذاری سوالات
const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));

// وضعیت کاربران
const users = {};

loveBot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!users[chatId]) {
    users[chatId] = {
      step: 0,
      answers: [],
      lang: 'fa', // پیش‌فرض: فارسی
    };

    loveBot.sendMessage(chatId, "🇮🇷 لطفاً زبان مورد نظر را انتخاب کن:\n🇸🇦 يرجى اختيار اللغة", {
      reply_markup: {
        keyboard: [['فارسی 🇮🇷', 'العربية 🇸🇦']],
        resize_keyboard: true,
        one_time_keyboard: true,
      }
    });
    return;
  }

  const user = users[chatId];

  // انتخاب زبان
  if (user.step === 0 && (text.includes("فارسی") || text.includes("العربية"))) {
    user.lang = text.includes("العربية") ? 'ar' : 'fa';
    user.step++;
    loveBot.sendMessage(chatId, user.lang === 'fa' ? "لینک دعوت پارتنرت رو وارد کن:" : "أرسل رابط دعوة شريكك:");
    return;
  }

  // لینک دعوت (فعلاً به عنوان متن دریافت می‌کنیم)
  if (user.step === 1) {
    user.partnerLink = text;
    user.step++;
    loveBot.sendMessage(chatId, user.lang === 'fa' ? "بزن بریم سراغ سوالات ❤️" : "لنبدأ الأسئلة ❤️");
    askNextQuestion(chatId);
    return;
  }

  // ذخیره پاسخ‌ها
  if (user.step > 1 && user.step - 2 < questions[user.lang].length) {
    user.answers.push(text);
    user.step++;
    askNextQuestion(chatId);
  }

  // پایان
  if (user.step - 2 === questions[user.lang].length) {
    loveBot.sendMessage(chatId, user.lang === 'fa' ? "🧠 در حال تحلیل پاسخ‌ها توسط هوش مصنوعی..." : "🧠 جاري تحليل إجاباتك من قبل الذكاء الاصطناعي...");

    const prompt = `
    تحلیل روانشناسی برای یک رابطه عاشقانه بر اساس پاسخ‌های زیر بده و ۱۰ پیشنهاد برای بهبود رابطه ارائه کن:
    ${user.answers.map((a, i) => `سوال ${i + 1}: ${a}`).join('\n')}
    `;

    try {
      const aiResponse = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }]
      });

      const analysis = aiResponse.data.choices[0].message.content;
      loveBot.sendMessage(chatId, analysis);
    } catch (error) {
      loveBot.sendMessage(chatId, user.lang === 'fa' ?
        "مشکلی در ارتباط با هوش مصنوعی پیش آمد. لطفاً بعداً تلاش کن." :
        "حدثت مشكلة في الاتصال بالذكاء الاصطناعي. حاول مرة أخرى لاحقًا.");
    }
  }
});

// ارسال سوال بعدی
function askNextQuestion(chatId) {
  const user = users[chatId];
  const index = user.step - 2;
  const question = questions[user.lang][index];

  if (!question) return;

  if (question.options) {
    loveBot.sendMessage(chatId, question.text, {
      reply_markup: {
        keyboard: [question.options],
        resize_keyboard: true,
        one_time_keyboard: true,
      }
    });
  } else {
    loveBot.sendMessage(chatId, question.text);
  }
}
