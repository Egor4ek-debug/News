import {getNewsData} from './newsScraper.js'
export async function checkForNewNews(bot, userSubscriptions, chatId, categoryTitle) { // Принимаем bot и userSubscriptions
  try {
    const newsData = await getNewsData(categoryTitle);
    const lastNewsTitle = userSubscriptions[chatId].lastNewsTitle || '';
    const newNews = [];

    for (const news of newsData) {
      if (lastNewsTitle !== news.title) {
        console.log(lastNewsTitle);
        console.log(news.title);
        newNews.push(news);
      } else {
        break;
      }
    }

    if (newNews.length > 0) {
      for (const news of newNews) {
        const { title, text, imgSrc } = news;
        const formattedTitle = `<b>${title}</b>`;
        const message = `${formattedTitle}\n${text}`;

        bot.sendPhoto(chatId, imgSrc, {
          caption: message,
          parse_mode: 'HTML',
        });

        userSubscriptions[chatId].lastNewsTitle = title;
      }
    }
  } catch (error) {
    console.error('Ошибка при получении новостей:', error.message);
    bot.sendMessage(chatId, 'Ошибка при получении новостей для рассылки.');
  }
}
