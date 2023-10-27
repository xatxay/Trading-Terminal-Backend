import TreeNews from './newScrape/treeNews.js';
// import OpenAiAnalyze from './newScrape/chatgpt.js';
import NewScraper from './newScrape/newScrape.js';
import { Binance, Upbit } from './newScrape/exchange.js';
import { ExchangeHeader, ExchangeParams } from './interface.js';

const main = async (): Promise<void> => {
  // const apiKey = process.env.OPENAI_API_KEY,
  //   prompt = process.env.CONTENT;
  const treeNews = new TreeNews(process.env.TREENEWS),
    upbitUrl: string = process.env.UPBIT,
    upbitParams: ExchangeParams = {
      search: process.env.UPBITSEARCH,
      page: 1,
      per_page: 1,
    },
    upbitHeader: ExchangeHeader = {
      'accept-language': 'en-KR, en;q=1, en;q=0.1',
    },
    binanceUrl = process.env.BINANCEURL,
    binanceParams: ExchangeParams = {
      catalogId: 48,
      pageNo: 1,
      pageSize: 1,
    },
    sources = [
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
      {
        name: 'Binance',
        url: process.env.BINANCEURL,
        selector: process.env.BINANCESELECTOR,
      },
    ];

  treeNews.startPing();

  try {
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

  try {
    const upbit = new Upbit(upbitUrl, upbitParams, upbitHeader),
      upbitListing = await upbit.getListing(),
      timeStampt = upbitListing.list[0].created_at,
      listingLink = `https://upbit.com/service_center/notice?id=${upbitListing.list[0].id}`;

    console.log(
      `Upbit Listing: ${upbitListing.list[0].title}\nTimestampt: ${timeStampt}\nLink: ${listingLink}`,
    );
  } catch (err) {
    console.error('Failed getting upbit listing: ', err);
  }

  try {
    const time = new Date(Date.now()),
      announcementTime = time.toISOString(),
      binance = new Binance(binanceUrl, binanceParams),
      binanceListing = await binance.getListing(),
      textFormat = binanceListing.articles[0].title
        .toLowerCase()
        .replaceAll(' ', '-'),
      listingLink = `https://www.binance.com/en/support/announcement/${textFormat}-${binanceListing.articles[0].code}`;

    console.log(
      `Binance Listing: ${binanceListing.articles[0].title}\nTimestampt: ${announcementTime}\nLink: ${listingLink}`,
    );
  } catch (err) {
    console.log('Failed getting binance listing: ', err);
  }
};

main();
