import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { SecData } from '../interface.js';

class NewScraper {
  url: string;
  parser: Parser;
  constructor(url: string) {
    this.url = url;
    this.parser = new Parser();
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

  public async fetchRssPage(): Promise<SecData[]> {
    const feed = await this.parser.parseURL(this.url);
    return feed.items as SecData[];
  }
}

export default NewScraper;
