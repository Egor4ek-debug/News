import TelegramBot from 'node-telegram-bot-api';
import { getNewsCategoriesWithLinks } from './newsParser.js';
import { getFirst2NewsLinksAndTexts } from './newsScraper.js';
import dotenv from 'dotenv';

dotenv.config();

const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

// Command /news
bot.onText(/\/news/, async (msg) => {
  const chatId = msg.chat.id;
  const categories = await getNewsCategoriesWithLinks();

  if (categories.length === 0) {
    bot.sendMessage(chatId, 'Unfortunately, failed to get news categories.');
  } else {
    const categoryButtons = categories.map(category => ({
      text: category.title,
      callback_data: category.href,
    }));

    const keyboard = categoryButtons.map(button => [button]); // Put each button in its own array

    bot.sendMessage(chatId, 'Choose a category:', {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }
});
// Handling user's category selection
// ... (подключение библиотек и настроек)

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const categoryLink = 'https://rg.ru/'+query.data; // Get the category link from callback_data
  try {
    const newsData = await getFirst2NewsLinksAndTexts(categoryLink);

    if (newsData.length === 0) {
      bot.sendMessage(chatId, 'Новости не найдены.');
    } else {
      for (let i = 0; i < newsData.length; i++) {
        const news = newsData[i];
        const { title, imgSrc } = news;

        const message = `${title}`;

        // Sending the news message with the image
        bot.sendPhoto(chatId, imgSrc, {
          caption: message,
          parse_mode: 'HTML',
        });
      }
    }
  } catch (error) {
    console.error('Error while fetching news:', error.message);
    bot.sendMessage(chatId, 'Ошибка при получении новостей.');
  }
});



export function startBot() {
  console.log('Telegram bot started.');
}
