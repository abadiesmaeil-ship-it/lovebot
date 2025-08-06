bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (text.includes('دوستم داری')) {
    bot.sendMessage(chatId, 'بیشتر از هر چیزی تو دنیا 💖');
  } else if (text.includes('چطوری')) {
    bot.sendMessage(chatId, 'دلم برات تنگ شده بود! 😊');
  } else {
    bot.sendMessage(chatId, 'عشقم بگو چی تو دلت هست؟ 😍');
  }
});
