import axios from 'axios';
import cheerio from 'cheerio';

// Function to get news categories with title and href
export async function getNewsCategoriesWithLinks() {
  try {
    const response = await axios.get('https://rg.ru/');
    const $ = cheerio.load(response.data);

    const categoriesWithLinks = [];
    $('.navresp-visibleListLink').each((index, element) => {
      const title = $(element).attr('title');
      const href = $(element).attr('href');
      
      if (title && href) {
        categoriesWithLinks.push({ title, href });
      }
    });

    return categoriesWithLinks.filter(category => 
      ['Экономика','В мире','Общество','Спорт','Культура'].includes(category.title)
    );
  } catch (error) {
    console.error('Error while fetching news categories with links:', error.message);
    throw error;
  }
}
