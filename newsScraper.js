import axios from 'axios';
import cheerio from 'cheerio';

export async function getNewsData(categoryLink) {
  try {
    const response = await axios.get('https://rg.ru' + categoryLink);
    const $ = cheerio.load(response.data);

    const newsData = [];

    $('.ItemOfListStandard_wrapper__bO1Hw.ItemOfListStandard_imageLeft__Mo4Nf').each((index, element) => {
      const articleElement = $(element);
      const title = articleElement.find('.ItemOfListStandard_title__eX0Jw').text();
      const imgSrc = articleElement.find('.Image_img__m9RSC.ItemOfListStandard_image___sWCo').attr('src');
      const articleLink = articleElement.find('.ItemOfListStandard_datetime__1tmwG').attr('href');

      newsData.push({
        title: title,
        imgSrc: imgSrc,
        articleLink: articleLink
      });
    });

    // Now let's fetch and add text content to the newsData
    for (let i = 0; i < newsData.length; i++) {
      const { articleLink } = newsData[i];
      const articleResponse = await axios.get('https://rg.ru' + articleLink);
      const articleHtml = articleResponse.data;
      const $$ = cheerio.load(articleHtml);

      const text = $$('.PageArticleContent_lead__gvX5C').text();
      newsData[i].text = text;
    }

    return newsData;
  } catch (error) {
    throw error;
  }
}
