import NewScraper from './newScrape.js';

const getHeadline = async (
  url: string,
  selector: string,
): Promise<string[]> => {
  const scraper = new NewScraper(url);
  const headlines = await scraper.scrapeHeadline(selector);
  return headlines;
};

export { getHeadline };
