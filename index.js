const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const app = express();

let qrCodeSVG = '';
let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// ساخت QR Code موقع استارت
client.on('qr', async (qr) => {
  console.log('📱 QR Code دریافت شد');
  qrCodeSVG = await qrcode.toDataURL(qr);
});

// وقتی وصل شد به واتساپ
client.on('ready', () => {
  console.log('✅ ربات به واتساپ وصل شد!');
  isReady = true;
});

client.initialize();

// نمایش QR در مرورگر
app.get("/", (req, res) => {
  if (isReady) {
    return res.send("<h2>✅ ربات به واتساپ وصله!</h2>");
  }
  if (qrCodeSVG) {
    return res.send(`
      <h2>📱 اسکن کن تا وصل بشی به ربات:</h2>
      <img src="${qrCodeSVG}" />
    `);
  } else {
    return res.send("<h3>⏳ منتظر دریافت QR Code...</h3>");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 سرور فعال شد روی پورت ${PORT}`);
});
