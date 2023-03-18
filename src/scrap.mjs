import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import enchantedlearning from './sources/enchantedlearning/enchantedlearning.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sources = [
  enchantedlearning,
];

await Promise.all(
  sources.map((source) => source.scrapAll()),
).then((categoriesWithWords) => (
  categoriesWithWords.reduce((a, b) => a.concat(b))
)).then((categoriesWithWords) => {
  categoriesWithWords.forEach(async (category) => {
    if (!category?.words?.length) return;

    const fullPath = path.resolve(
      __dirname,
      '../anything-wildcards',
    );

    await fs.mkdir(
      fullPath,
      {
        recursive: true,
      },
    );

    await fs.writeFile(
      path.resolve(
        fullPath,
        `${category.name}.txt`,
      ),
      category.words.join('\n'),
    );
  });
});
