// newsParser.js
import axios from 'axios';
import cheerio from 'cheerio';

export async function getFirst2NewsLinksAndTexts(categoryLink) {
  try {
    const response = await axios.get(categoryLink);
    const $ = cheerio.load(response.data);

    const newsData = [];

    $('.ItemOfListStandard_wrapper__bO1Hw').each((index, element) => {
      const title = $(element).find('.ItemOfListStandard_title__eX0Jw').text();
      const link = 'https://rg.ru' + $(element).find('a.ItemOfListStandard_title__eX0Jw').parent().attr('href');
      const imgSrc = $(element).find('.ItemOfListStandard_image___sWCo').attr('src');

      if (title && link && imgSrc) {
        newsData.push({ title, link, imgSrc });
      }

      if (newsData.length === 2) {
        return false; // Stop iteration after 2 news items
      }
    });

    return newsData;
  } catch (error) {
    console.error('Error while fetching news:', error.message);
    throw error;
  }
}
