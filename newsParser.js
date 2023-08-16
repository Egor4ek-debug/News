import axios from 'axios';
import cheerio from 'cheerio';

export async function getCategories() {
  try {
    const response = await axios.get('https://rg.ru/');
    const $ = cheerio.load(response.data);

    const categories = [];
    $('.navresp-visibleListLink').each((index, element) => {
      const title = $(element).attr('title');
      const href = $(element).attr('href');

      if (title && href) {
        categories.push({ title, href });
      }
    });

    return categories;
  } catch (error) {
    throw error;
  }
}
