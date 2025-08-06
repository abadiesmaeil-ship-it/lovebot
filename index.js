require('dotenv').config();
const { Telegraf } = require('telegraf');
const { Configuration, OpenAIApi } = require('openai');

const bot = new Telegraf(process.env.BOT_TOKEN);

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// زبان پیش‌فرض کاربر
const userLang = {};
const userPartner = {};
const userAnswers = {};
const questions = require('./questions.json');

// مرحله ورود
bot.start((ctx) => {
  userLang[ctx.from.id] = null;
  ctx.reply('👋 لطفاً زبان خود را انتخاب کنید:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'فارسی 🇮🇷', callback_data: 'lang_fa' }],
        [{ text: 'العربية 🇸🇦', callback_data: 'lang_ar' }]
      ]
    }
  });
});

// انتخاب زبان
bot.action(/lang_(.+)/, (ctx) => {
  const lang = ctx.match[1];
  userLang[ctx.from.id] = lang;
  ctx.reply(lang === 'fa'
    ? 'برای شروع، آی‌دی تلگرام پارتنرت رو بدون @ وارد کن (مثلاً: esmaeil123)'
    : 'لبداية، الرجاء إرسال اسم مستخدم شريكك بدون @ (مثال: ali123)');
});

// گرفتن آیدی پارتنر
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const lang = userLang[userId];

  if (!userPartner[userId]) {
    const partnerUsername = ctx.message.text.trim();
    userPartner[userId] = partnerUsername;
    ctx.reply(lang === 'fa'
      ? '✅ دعوتنامه برای پارتنرت ارسال شد. منتظر باش تا ایشون هم وارد بشه.'
      : '✅ تم إرسال الدعوة إلى شريكك. الرجاء الانتظار حتى ينضم.');

    try {
      await bot.telegram.sendMessage(`@${partnerUsername}`, lang === 'fa'
        ? `👋 سلام! پارتنرت شما رو دعوت کرده تا در یک آزمون تحلیلی رابطه شرکت کنید. لطفاً به ربات پیام بده تا شروع کنیم.`
        : `👋 مرحبًا! شريكك دعاك للانضمام إلى اختبار تحليل العلاقة. الرجاء بدء المحادثة مع الروبوت.`);
    } catch (err) {
      ctx.reply(lang === 'fa'
        ? '❌ نتونستم پیامو برای پارتنرت بفرستم. مطمئنی یوزرنیم درسته؟'
        : '❌ لم أستطع إرسال الرسالة إلى شريكك. تأكد من صحة اسم المستخدم.');
    }
    return;
  }

  // سؤالات شروع شده
  if (!userAnswers[userId]) {
    userAnswers[userId] = { currentQ: 0, answers: [] };
  }

  const current = userAnswers[userId];
  const question = questions[lang][current.currentQ];

  if (question) {
    if (question.options) {
      const valid = question.options.includes(ctx.message.text.trim());
      if (!valid) {
        return ctx.reply(lang === 'fa'
          ? '❗ لطفاً یکی از گزینه‌های مشخص‌شده رو انتخاب کن.'
          : '❗ الرجاء اختيار خيار صالح من القائمة.');
      }
    }
    current.answers.push({
      q: question.q,
      a: ctx.message.text.trim()
    });
    current.currentQ++;

    // سؤال بعدی
    const nextQ = questions[lang][current.currentQ];
    if (nextQ) {
      return ctx.reply(nextQ.q, nextQ.options ? {
        reply_markup: {
          keyboard: [nextQ.options.map((opt) => ({ text: opt }))],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      } : undefined);
    } else {
      ctx.reply(lang === 'fa'
        ? '⏳ تحلیل رابطه در حال پردازشه...'
        : '⏳ يتم الآن تحليل علاقتك...');
      analyzeRelationship(userId, current.answers, lang, ctx);
    }
  }
});

// تابع تحلیل با OpenAI
async function analyzeRelationship(userId, answers, lang, ctx) {
  const summaryPrompt = `
  کاربر به سوالات زیر اینگونه پاسخ داده است:\n${answers.map(a => `Q: ${a.q}\nA: ${a.a}`).join('\n\n')}
  
  لطفاً یک تحلیل روانشناختی از رابطه آن‌ها ارائه بده به زبان ${lang === 'fa' ? 'فارسی' : 'عربی'} و ۱۰ پیشنهاد دوستانه برای بهبود رابطه‌شان ارائه بده.
  `;

  try {
    const gptRes = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: summaryPrompt }]
    });

    const output = gptRes.data.choices[0].message.content;
    ctx.reply(output);
  } catch (e) {
    ctx.reply(lang === 'fa'
      ? '❌ مشکلی در تحلیل رابطه به وجود آمد. لطفاً بعداً امتحان کن.'
      : '❌ حدث خطأ أثناء تحليل العلاقة. الرجاء المحاولة لاحقًا.');
  }
}

bot.launch();
console.log('🤖 ربات شروع به کار کرد...');
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
require('dotenv').config();

// ربات تلگرام
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// کلید API هوش مصنوعی
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// شروع ربات
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  try {
    // ارسال پیام کاربر به هوش مصنوعی
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    });

    const aiReply = completion.choices[0].message.content;

    // ارسال پاسخ هوش مصنوعی به کاربر
    await bot.sendMessage(chatId, aiReply);

  } catch (error) {
    console.error("AI error:", error.message);
    await bot.sendMessage(chatId, "❌ مشکلی در ارتباط با هوش مصنوعی به وجود آمد. لطفاً دوباره تلاش کن.");
  }
});
