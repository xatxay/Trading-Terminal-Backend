import TreeNews from './newScrape/treeNews.js';
// import OpenAiAnalyze from './newScrape/chatgpt.js';
import NewScraper from './newScrape/newScrape.js';
import { Binance, Upbit } from './newScrape/exchange.js';
import { ExchangeHeader, ExchangeParams } from './interface.js';

const main = async (): Promise<void> => {
  // const apiKey = process.env.OPENAI_API_KEY,
  //   prompt = process.env.CONTENT;
  const treeNews = new TreeNews(process.env.TREENEWS);

  treeNews.startPing();

  const newsOutlet = async (): Promise<void> => {
    try {
      const sources = [
        {
          name: 'theBlock',
          url: process.env.THEBLOCKURL,
          selector: process.env.THEBLOCKSELECTOR,
        },
        {
          name: 'Coindesk',
          url: process.env.COINDESKURL,
          selector: process.env.COINDESKSELECTOR,
        },
      ];

      for (const source of sources) {
        const newsHeadline = new NewScraper(source.url);
        const headlines = await newsHeadline.scrapeHeadline(source.selector);
        console.log(`${source.name}:\n`, headlines[0]);
        // const analyzer = new OpenAiAnalyze(apiKey, prompt, headlines[0]);
        // analyzer.callOpenAi();
      }
    } catch (err) {
      console.error('Failed getting headlines: ', err);
    }
  };

  const upbitScrape = async (): Promise<void> => {
    try {
      const upbitUrl: string = process.env.UPBIT,
        upbitParams: ExchangeParams = {
          search: process.env.UPBITSEARCH,
          page: 1,
          per_page: 1,
        },
        upbitHeader: ExchangeHeader = {
          'accept-language': 'en-KR, en;q=1, en;q=0.1',
        },
        upbit = new Upbit(upbitUrl, upbitParams, upbitHeader),
        upbitListing = await upbit.getListing(),
        timeStampt = upbitListing.list[0].created_at,
        listingLink = `https://upbit.com/service_center/notice?id=${upbitListing.list[0].id}`;

      console.log(
        `Upbit Listing: ${upbitListing.list[0].title}\nTimestampt: ${timeStampt}\nLink: ${listingLink}\n`,
      );
    } catch (err) {
      console.error('Failed getting upbit listing: ', err);
    }
  };

  const binanceScrape = async (): Promise<void> => {
    try {
      const binanceUrl = process.env.BINANCEURL,
        binanceParams: ExchangeParams = {
          catalogId: 48,
          pageNo: 1,
          pageSize: 1,
        },
        time = new Date(Date.now()),
        announcementTime = time.toISOString(),
        binance = new Binance(binanceUrl, binanceParams),
        binanceListing = await binance.getListing(),
        textFormat = binanceListing.articles[0].title
          .toLowerCase()
          .replaceAll(' ', '-'),
        listingLink = `https://www.binance.com/en/support/announcement/${textFormat}-${binanceListing.articles[0].code}`;

      console.log(
        `Binance Listing: ${binanceListing.articles[0].title}\nTimestampt: ${announcementTime}\nLink: ${listingLink}\n`,
      );
    } catch (err) {
      console.log('Failed getting binance listing: ', err);
    }
  };

  const secScrape = async (): Promise<void> => {
    try {
      const secUrl = process.env.SECURL;
      const feed = new NewScraper(secUrl),
        pressreleases = await feed.fetchRssPage(),
        title = pressreleases[0].title,
        link = pressreleases[0].link,
        contentSnippet = pressreleases[0].contentSnippet,
        date = pressreleases[0].isoDate;

      console.log(
        `pressreleases: ${title}\nContent snippet: ${contentSnippet}\nLink: ${link}\nTimestampt: ${date}`,
      );
    } catch (err) {
      console.error('Error fetching SEC rss data: ', err);
    }
  };

  await Promise.all([
    newsOutlet(),
    upbitScrape(),
    binanceScrape(),
    secScrape(),
  ]);
};

main();
