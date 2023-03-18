import enchantedlearning from './sources/enchantedlearning/enchantedlearning.mjs';

const sources = [
  enchantedlearning,
];

await Promise.all(
  sources.map((source) => source.scrapAll()),
);
