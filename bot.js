import TelegramBot from 'node-telegram-bot-api';
import { getNewsCategories } from './newsParser.js';
import { getFirstNewsLink, getNewsContent } from './newsScraper.js';
import dotenv from 'dotenv'

dotenv.config()

const botToken = process.env.BOT_TOKEN; // Замените на ваш токен
const bot = new TelegramBot(botToken, { polling: true });

// Function to create InlineKeyboardMarkup with category buttons
function createCategoryButtons(categories) {
  return categories.map((category) => [
    {
      text: category.category,
      callback_data: category.link, // Pass the category link as the callback_data
    },
  ]);
}

// Command /news
bot.onText(/\/news/, async (msg) => {
  const chatId = msg.chat.id;
  const categories = await getNewsCategories();

  if (categories.length === 0) {
    bot.sendMessage(chatId, 'Unfortunately, failed to get news categories.');
  } else {
    const categoryButtons = createCategoryButtons(categories);
    bot.sendMessage(chatId, 'Выберите интересующую категорию', {
      reply_markup: {
        inline_keyboard: categoryButtons,
      },
    });
  }
});

// Handling user's category selection
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const categoryLink = query.data; // Get the category link from callback_data

  try {
    const {firstNewsLink,photoURL} = await getFirstNewsLink(categoryLink);
    const { title, textOverview } = await getNewsContent(firstNewsLink);
    // const photoURL = await getNewsPhoto(firstNewsLink);

    // Creating a formatted message with the title in bold
    const formattedMessage = `<b>${title}</b>\n\n${textOverview}`;

    // Sending the news title, text, and photo to the user in one message with formatting
    // bot.sendMessage(chatId, formattedMessage, { parse_mode: 'HTML' })
    // const messageWithMedia = `https://s0.rbk.ru/v6_top_pics/media/img/9/82/346912401956829.jpeg`;
    bot.sendPhoto(chatId, photoURL, {
      caption: `${formattedMessage}\n`,
      parse_mode: 'HTML',
    });
    console.log(textOverview);
  } catch (error) {
    console.error('Error while fetching news:', error.message);
    bot.sendMessage(chatId, 'Error while fetching news.');
  }
});

export function startBot() {
  console.log('Telegram bot started.');
}
