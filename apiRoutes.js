import { getNewsCategories } from './newsParser.js';

// API endpoint для получения категорий новостей
export function setupApiRoutes(app) {
  app.get('/api/news/categories', async (req, res) => {
    try {
      const categories = await getNewsCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Error while fetching news categories' });
    }
  });
}
