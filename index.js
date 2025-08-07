require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sessions = {};
const questions = JSON.parse(fs.readFileSync(path.join(__dirname, "questions.json"), "utf-8"));

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  sessions[chatId] = { step: "language_selection", answers: [], partner: null, language: null };

  bot.sendMessage(chatId, "👋 لطفاً زبان خود را انتخاب کنید:", {
    reply_markup: {
      keyboard: [["فارسی", "العربية"]],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!sessions[chatId]) return;

  const session = sessions[chatId];

  // انتخاب زبان
  if (session.step === "language_selection") {
    if (text === "فارسی" || text === "العربية") {
      session.language = text === "فارسی" ? "fa" : "ar";
      session.step = "partner_username";
      bot.sendMessage(chatId, text === "فارسی" ?
        "لطفاً یوزرنیم پارتنرتون رو وارد کنید (بدون @):" :
        "يرجى إدخال اسم مستخدم شريكك (بدون @):");
    } else {
      bot.sendMessage(chatId, "لطفاً یکی از زبان‌های موجود را انتخاب کنید.");
    }
    return;
  }

  // وارد کردن یوزرنیم پارتنر
  if (session.step === "partner_username") {
    session.partner = text;
    session.step = "question_0";
    const q = questions[session.language][0];
    sendQuestion(chatId, q, session.language);
    return;
  }

  // پاسخ به سوالات
  if (session.step.startsWith("question_")) {
    const qIndex = parseInt(session.step.split("_")[1]);
    const currentQuestion = questions[session.language][qIndex];

    session.answers.push({ question: currentQuestion.question, answer: text });

    const nextIndex = qIndex + 1;
    if (nextIndex < questions[session.language].length) {
      session.step = `question_${nextIndex}`;
      const nextQ = questions[session.language][nextIndex];
      sendQuestion(chatId, nextQ, session.language);
    } else {
      session.step = "done";
      bot.sendMessage(chatId, session.language === "fa" ?
        "✅ ممنون از پاسخ‌ها. در حال تحلیل رابطه هستم..." :
        "✅ شكراً لإجاباتك. يتم تحليل العلاقة...");

      const prompt = generatePrompt(session.answers, session.language);
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });

      const result = completion.choices[0].message.content;

      // ارسال به پارتنر (در حالت واقعی باید شناسه یا چت آیدی ذخیره شود)
      bot.sendMessage(chatId, result);
    }
    return;
  }
});

// تابع ارسال سوال
function sendQuestion(chatId, q, lang) {
  const options = q.options && q.options.length > 0 ? {
    reply_markup: {
      keyboard: [q.options],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  } : {};
  bot.sendMessage(chatId, `❓ ${q.question}`, options);
}

// ساخت پرامپت برای تحلیل
function generatePrompt(answers, lang) {
  const intro = lang === "fa"
    ? "تو یک روانشناس متخصص در زمینه روابط عاشقانه هستی. تحلیل کن:"
    : "أنت خبير نفسي مختص في العلاقات. قم بالتحليل:";
  let full = intro + "\n\n";
  answers.forEach((a, i) => {
    full += `${i + 1}. ${a.question}\nپاسخ: ${a.answer}\n\n`;
  });
  full += lang === "fa"
    ? "یک تحلیل کلی بده، ۵ نکته مثبت، ۵ نقطه ضعف و ۱۰ پیشنهاد برای بهبود رابطه بنویس."
    : "اعط تحليل عام، 5 نقاط إيجابية، 5 نقاط ضعف، و 10 نصائح لتحسين العلاقة.";
  return full;
}
