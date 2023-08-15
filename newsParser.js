import axios from 'axios';
import cheerio from 'cheerio';

// Функция для получения категорий новостей с сайта РБК
export async function getNewsCategories() {
  try {
    const response = await axios.get('https://www.rbc.ru/');
    const $ = cheerio.load(response.data);

    const categories = [];
    $('.topline__item.js-yandex-counter').each((index, element) => {
      const category = $(element).text().trim();
      const link = $(element).attr('href');

      // Фильтруем только интересующие нас категории
      if (['Спорт', 'Политика', 'Экономика', 'Бизнес', 'Технологии и медиа'].includes(category)) {
        categories.push({ category, link });
      }
    });

    return categories;
  } catch (error) {
    console.error('Error while fetching news categories:', error.message);
    return [];
  }
}
