import axios from 'axios';
import * as cheerio from 'cheerio';

class NewScraper {
  url: string;
  constructor(url: string) {
    this.url = url;
  }

  private async fetchHtml(): Promise<string | null> {
    try {
      const { data } = await axios.get(this.url);
      return data;
    } catch (err) {
      console.error('Failed getting html: ', err);
      return null;
    }
  }

  public async scrapeHeadline(selector: string): Promise<string[]> {
    const html = await this.fetchHtml();
    if (!html) return [];

    const $ = cheerio.load(html);
    const headlines: string[] = [];
    $(selector).each((_idx, el) => {
      const headline = $(el).text();
      headlines.push(headline);
    });
    return headlines;
  }
}

export default NewScraper;
