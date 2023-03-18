import axios from 'axios';
import { load } from 'cheerio';
import snakeCase from 'lodash/snakeCase.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fallbackReadFile = async (path) => {
  try {
    await fs.readFile(path);
  } catch (e) {
    return '';
  }
};

const scrapCategories = async () => {
  const CATEGORIES_URL = 'https://www.enchantedlearning.com/wordlist/';

  const categoriesHtml = (await axios.get(CATEGORIES_URL)).data;
  const $ = load(categoriesHtml);

  const categories = $('.page-list-item__title a').map((_, el) => ({
    name: snakeCase($(el).text()),
    href: $(el).attr('href'),
  })).get();

  return categories;
};

const cachedScrapCategories = async () => {
  const CATEGORIES_PATH = path.resolve(__dirname, 'cache/categories.json');
  const categoriesFile = await fallbackReadFile(CATEGORIES_PATH);

  if (categoriesFile) return JSON.parse(categoriesFile);

  const categories = await scrapCategories();
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(categories));

  return categories;
};

const scrapAll = async () => {
  const categories = await cachedScrapCategories();

  console.log(categories);
};

const enchantedlearning = {
  scrapAll,
};

export default enchantedlearning;
