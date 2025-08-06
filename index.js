require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let sessions = {}; // ساختار برای ذخیره کاربران، زبان، لینک و پاسخ‌ها

const languages = {
  fa: "🇮🇷 فارسی",
  ar: "🇸🇦 عربي"
};

const questions = {
  fa: [
    { text: "از ۱ تا ۱۰ چقدر پارتنرتو دوست داری؟", type: "input", key: "love_score" },
    { text: "از ۱ تا ۱۰ چقدر از رابطه‌تون راضی هستی؟", type: "input", key: "relation_score" },
    { text: "آیا در رابطه جنسی، کسی دیگر را تصور کردی؟", type: "choice", key: "imagining_other", options: ["بله", "خیر"] },
    { text: "آیا به پارتنرت خیانت احساسی کردی؟", type: "choice", key: "emotional_cheat", options: ["بله", "خیر"] },
    { text: "آیا تا حالا با پارتنر قبلی‌ات در این رابطه صحبت کردی؟", type: "choice", key: "old_partner", options: ["بله", "خیر"] },
    { text: "۳ ویژگی مثبت پارتنرت رو بنویس", type: "input", key: "positives" },
    { text: "۳ ویژگی که دوست داری بهتر بشن", type: "input", key: "improvements" },
  ],
  ar: [
    { text: "من ١ إلى ١٠، كم تحب شريكك؟", type: "input", key: "love_score" },
    { text: "من ١ إلى ١٠، كم أنت راضٍ عن العلاقة؟", type: "input", key: "relation_score" },
    { text: "هل تخيلت شخصًا آخر أثناء علاقة الجنس؟", type: "choice", key: "imagining_other", options: ["نعم", "لا"] },
    { text: "هل خنت شريكك مشاعرياً؟", type: "choice", key: "emotional_cheat", options: ["نعم", "لا"] },
    { text: "هل تواصلت مع شريكك السابق؟", type: "choice", key: "old_partner", options: ["نعم", "لا"] },
    { text: "اكتب ٣ صفات إيجابية في شريكك", type: "input", key: "positives" },
    { text: "اكتب ٣ أشياء تريد تحسينها", type: "input", key: "improvements" },
  ]
};

// شروع با انتخاب زبان
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sessions[chatId] = { step: "language" };

  const options = {
    reply_markup: {
      keyboard: [[languages.fa], [languages.ar]],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, "لطفاً زبان خود را انتخاب کنید:", options);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  let session = sessions[chatId];

  if (!session) return;

  if (session.step === "language") {
    if (text === languages.fa) session.lang = "fa";
    else if (text === languages.ar) session.lang = "ar";
    else return bot.sendMessage(chatId, "زبان معتبر نیست");

    session.step = "link";
    session.answers = {};

    const inviteLink = `https://t.me/${bot.username}?start=${chatId}`;
    session.inviteLink = inviteLink;

    bot.sendMessage(chatId, `لینک دعوت را برای پارتنر خود بفرست:\n${inviteLink}`);
    bot.sendMessage(chatId, session.lang === "fa" ? "بعد از ورود پارتنرت، سوالات شروع می‌شوند." : "بعد دخول شريكك، ستبدأ الأسئلة.");
    return;
  }

  // شروع پرسش‌ها
  const qList = questions[session.lang];
  if (!session.currentQ) session.currentQ = 0;

  if (session.currentQ < qList.length) {
    const current = qList[session.currentQ];

    // ذخیره پاسخ
    if (session.currentQ > 0) {
      const prev = qList[session.currentQ - 1];
      session.answers[prev.key] = text;
    }

    // سوال بعدی
    if (current.type === "choice") {
      const options = {
        reply_markup: {
          keyboard: [current.options.map(opt => opt)],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      };
      bot.sendMessage(chatId, current.text, options);
    } else {
      bot.sendMessage(chatId, current.text);
    }

    session.currentQ++;
  } else {
    // همه پاسخ‌ها ثبت شد
    bot.sendMessage(chatId, session.lang === "fa" ? "پاسخ‌های شما ثبت شد ✅" : "تم تسجيل إجاباتك ✅");

    // ارسال به هوش مصنوعی
    const aiPrompt = Object.entries(session.answers).map(([k, v]) => `${k}: ${v}`).join('\n');

    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `تحلیل روانشناختی این پاسخ‌ها رو بده:\n${aiPrompt}` }]
      }, {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      const analysis = response.data.choices[0].message.content;
      bot.sendMessage(chatId, session.lang === "fa" ? `🔍 تحلیل رابطه:\n${analysis}` : `🔍 تحليل العلاقة:\n${analysis}`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, session.lang === "fa" ? "مشکلی در ارتباط با هوش مصنوعی پیش آمد." : "حدثت مشكلة مع الذكاء الاصطناعي.");
    }
  }
});
