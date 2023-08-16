import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { getCategories } from './newsParser.js';
import { getNewsData } from './newsScraper.js';
import {
  userSubscriptions,
  subscribeUser,
  unsubscribeUser,
  isSubscribed,
} from './subscriptions.js';

dotenv.config();

const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });
// Функция для получения текста категории из слага
function getCategoryFromSlug(slug) {
  switch (slug) {
    case '/tema/ekonomika':
      return 'Экономика';
    case '/tema/mir':
      return 'В мире';
    case '/tema/obshestvo':
      return 'Общество';
    case '/tema/sport':
      return 'Спорт';
    case '/tema/kultura':
      return 'Культура';
    // Добавьте другие варианты слагов и соответствующие категории
    default:
      return null; // Возвращаем null, если слаг не распознан
  }
}

bot.onText(/\/news/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const categories = await getCategories();

    if (categories.length === 0) {
      bot.sendMessage(chatId, 'Unfortunately, failed to get news categories.');
    } else {
      const categoryButtons = categories
        .filter((category) =>
          ['Экономика', 'В мире', 'Общество', 'Спорт', 'Культура'].includes(
            category.title
          )
        )
        .map((category) => ({
          text: category.title,
          callback_data: category.href,
        }));

      const keyboard = categoryButtons.map((button) => [button]);

      bot.sendMessage(chatId, 'Choose a category:', {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
  } catch (error) {
    console.error('Error while fetching categories:', error.message);
    bot.sendMessage(chatId, 'Error while fetching categories.');
  }
});

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const categories = await getCategories();

    if (categories.length === 0) {
      bot.sendMessage(chatId, 'Категории новостей не найдены.');
    } else {
      const categoryButtons = categories
        .filter((category) =>
          ['Экономика', 'В мире', 'Общество', 'Спорт', 'Культура'].includes(
            category.title
          )
        )
        .map((category) => ({
          text: category.title,
          callback_data: `subscribe ${category.href}`,
        }));

      const keyboard = categoryButtons.map((button) => [button]);

      bot.sendMessage(chatId, 'Выберите категорию для подписки:', {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
  } catch (error) {
    console.error('Ошибка при получении категорий новостей:', error.message);
    bot.sendMessage(chatId, 'Ошибка при получении категорий новостей.');
  }
});

bot.onText(/\/unsubscribe/, (msg) => {
  const chatId = msg.chat.id;

  if (unsubscribeUser(chatId)) {
    bot.sendMessage(chatId, 'Вы успешно отписались от рассылки.');
  } else {
    bot.sendMessage(chatId, 'Вы не были подписаны на рассылку.');
  }
});

bot.onText(/\/checksubscription/, (msg) => {
  const chatId = msg.chat.id;

  if (isSubscribed(chatId)) {
    bot.sendMessage(chatId, 'Вы подписаны на рассылку.');
  } else {
    bot.sendMessage(chatId, 'Вы не подписаны на рассылку.');
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const categoryTitle = query.data;
  const queryData = query.data;
  if (queryData.startsWith('/tema')) {
    try {
      const newsData = await getNewsData(categoryTitle);

      if (newsData.length === 0) {
        bot.sendMessage(chatId, 'Новости не найдены.');
      } else {
        for (let i = 0; i < newsData.length; i++) {
          const news = newsData[i];
          const { title, text, imgSrc } = news;

          const formattedTitle = `<b>${title}</b>`;
          const message = `${formattedTitle}\n${text}`;

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
  } else if (queryData.startsWith('subscribe')) {
    const [, categoryTitle] = queryData.split(' ');

    if (isSubscribed(chatId)) {
      bot.sendMessage(chatId, 'Вы уже подписаны на рассылку.');
      return;
    }

    const categoryText = getCategoryFromSlug(categoryTitle)
    // Сохраняем выбор пользователя в объекте userSubscriptions
    const intervalId = setInterval(async () => {
      try {
        const newsData = await getNewsData(categoryTitle);

        if (newsData.length === 0) {
          bot.sendMessage(chatId, 'Новости не найдены.');
        } else {
          for (const news of newsData) {
            const { title, text, imgSrc } = news;

            const formattedTitle = `<b>${title}</b>`;
            const message = `${formattedTitle}\n${text}`;

            bot.sendPhoto(chatId, imgSrc, {
              caption: message,
              parse_mode: 'HTML',
            });
          }
        }
      } catch (error) {
        console.error('Ошибка при получении новостей:', error.message);
        bot.sendMessage(
          chatId,
          'Ошибка при получении новостей для рассылки.'
        );
      }
    }, 15 * 1000);

    subscribeUser(chatId, categoryTitle, intervalId);
    bot.sendMessage(
      chatId,
      `Вы успешно подписались на категорию новостей: ${categoryText}`
    );
  }
});

console.log('Telegram bot started.');
