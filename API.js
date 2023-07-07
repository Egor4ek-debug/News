import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import TelegramBot from 'node-telegram-bot-api';

const app = express();
const PORT = 3000;
const token = '6262159051:AAHaWUotBryvfBpWWX3mcsLUhh36_iG2TPY';

// Создаем экземпляр Telegram бота
const bot = new TelegramBot(token, { polling: true });

// Словарь, который будет хранить ссылки на страницы для каждой категории
const categoryPages = {
  Спорт: 'https://sportrbc.ru/?utm_source=topline',
  Политика: 'https://www.rbc.ru/politics/?utm_source=topline',
  Экономика: 'https://www.rbc.ru/economics/?utm_source=topline',
  Бизнес: 'https://www.rbc.ru/business/?utm_source=topline/',
  'Технологии и медиа': 'https://www.rbc.ru/technology_and_media/?utm_source=topline',
};

app.get('/categories', async (req, res) => {
  try {
    const categories = Object.keys(categoryPages);
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

app.get('/news/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const url = categoryPages[category];
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const news = [];

    $('.item__link.rm-cm-item-link.js-rm-central-column-item-link').each(
      (index, element) => {
        const title = $(element)
          .find('.item__title.rm-cm-item-text.js-rm-central-column-item-text')
          .text()
          .trim();
        const link = $(element).attr('href');
        news.push({ title, link });
      }
    );

    const slicedNews = news.slice(0, 3);

    res.json(slicedNews);
  } catch (error) {
    console.error(error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

// Обработка команды /news
bot.onText(/\/news/, async (msg) => {
  const chatId = msg.chat.id;

  // Получаем категории с вашего API
  try {
    const categoriesResponse = await axios.get('http://localhost:3000/categories');
    const categories = categoriesResponse.data;

    // Создаем массив кнопок с категориями
    const keyboard = categories.map((category) => ({
      text: category,
      callback_data: category,
    }));

    // Отправляем кнопки с категориями пользователю в Telegram
    bot.sendMessage(chatId, 'Выберите категорию:', {
      reply_markup: {
        inline_keyboard: [keyboard],
      },
    });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз позже.');
  }
});

// Обработка выбора категории
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const category = query.data;

  // Парсим данные с выбранной страницы категории
  try {
    const response = await axios.get(`http://localhost:3000/news/${category}`);
    const slicedNews = response.data;

    // Отправляем новости пользователю в Telegram
    slicedNews.forEach((item) => {
      bot.sendPhoto(chatId, item.link, { caption: item.title });
    });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз позже.');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
