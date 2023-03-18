import axios from 'axios';
import { load } from 'cheerio';
import snakeCase from 'lodash/snakeCase.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CATEGORIES_URL = 'https://www.enchantedlearning.com/wordlist/';
const CATEGORIES_PATH = path.resolve(__dirname, 'cache/categories.json');
const CATEGORIES_WORDS_PATH = path.resolve(__dirname, 'categories-words.json');

const fallbackReadFile = async (path) => {
  try {
    return (await fs.readFile(path)).toString();
  } catch (e) {
    return '';
  }
};

const scrapCategories = async () => {
  const categoriesHtml = (await axios.get(CATEGORIES_URL)).data;
  const $ = load(categoriesHtml);

  const categories = $('.page-list-item__title a').map((_, el) => ({
    name: snakeCase($(el).text()),
    href: `https://www.enchantedlearning.com${$(el).attr('href')}`,
  })).get();

  return categories;
};

const cachedScrapCategories = async (bust = false) => {
  const categoriesFile = await fallbackReadFile(CATEGORIES_PATH);

  if (categoriesFile && !bust) return JSON.parse(categoriesFile);

  const categories = await scrapCategories();
  await fs.writeFile(CATEGORIES_PATH, JSON.stringify(categories, null, 2));

  return categories;
};

const scrapCategoryWords = async (url) => {
  const categoriesHtml = (await axios.get(url)).data;
  const $ = load(categoriesHtml);

  return $('.wordlist-item').map((_, el) => (
    snakeCase($(el).text()).replace(/_/g, ' ')
  )).get();
};

const cleanUp = (categoriesWithWords) => categoriesWithWords.filter((
  (category) => category && !category.name.includes('fry_word')
));

const scrapAll = async () => {
  const scrappedContent = await fallbackReadFile(CATEGORIES_WORDS_PATH);
  if (scrappedContent) {
    console.log(`"${CATEGORIES_WORDS_PATH}" is not empty.\nSkipping scrap ...`);
    return cleanUp(JSON.parse(scrappedContent));
  }

  const categories = await cachedScrapCategories(true);

  const words = await Promise.all(
    categories.map(async (category) => {
      category.words = await scrapCategoryWords(category.href);
      return category;
    }),
  );

  await fs.writeFile(CATEGORIES_WORDS_PATH, JSON.stringify(words, null, 2));

  return cleanUp(words);
};

const enchantedlearning = {
  scrapAll,
};

export default enchantedlearning;
