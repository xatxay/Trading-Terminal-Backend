import NewScraper from './newScrape.js';

// const getHeadline = async (
//   url: string,
//   selector: string,
// ): Promise<string[]> => {
//   const scraper = new NewScraper(url);
//   const headlines = await scraper.scrapeHeadline(selector);
//   return headlines;
// };

class Headlines {
  scraper: NewScraper;

  constructor(url: string) {
    this.scraper = new NewScraper(url);
  }

  public async get(selector: string): Promise<string[]> {
    return await this.scraper.scrapeHeadline(selector);
  }
}

export default Headlines;
