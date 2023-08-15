// newsScraper.js
import axios from 'axios';
import cheerio from 'cheerio';

// Function to get the first news link in the specified category
export async function getFirstNewsLink(categoryLink) {
  try {
    const response = await axios.get(categoryLink);
    const $ = cheerio.load(response.data);

    // Parsing the link of the first news
    const firstNewsLink = $(
      'a.item__link.rm-cm-item-link.js-rm-central-column-item-link'
    ).attr('href');
    let photoURL;
    if (categoryLink != 'https://sportrbc.ru/?utm_source=topline') {
      photoURL = $('.smart-image__img').eq(7).attr('src');
    } else {
      photoURL = $('.smart-image__img').attr('src');
    }

    if (!firstNewsLink) {
      throw new Error('The link to the first news was not found.');
    }

    return { firstNewsLink, photoURL };
  } catch (error) {
    console.error('Error while fetching news link:', error.message);
    throw error;
  }
}

// Function to get the title and text of the news based on the link
export async function getNewsContent(newsLink) {
  try {
    const response = await axios.get(newsLink);
    const $ = cheerio.load(response.data);

    // Parsing the news title
    const title = $('h1.article__header__title-in').text().trim();

    if (!title) {
      throw new Error('The news title was not found.');
    }

    // Parsing the text from the <span> tag inside the <div> with class 'article__text__overview'
    let textOverview;
    textOverview = $('div.article__text__overview span').text().trim();
    if (textOverview == '') {
      textOverview = politicsNews(newsLink)
      console.log(textOverview);
    }
    if (!textOverview) {
      throw new Error('The news text was not found.');
    }

    // Fetching the photo URL from the article content
    // const articleLink = $('div.article__text__overview a').attr('href');

    return { title, textOverview };
  } catch (error) {
    console.error('Error while fetching news content:', error.message);
    throw error;
  }
}
async function politicsNews(newsLink){
  const response = await axios.get(newsLink);
  const $ = cheerio.load(response.data);
  const textOverview = $('article__header__yandex').text().trim();
  return textOverview
}

