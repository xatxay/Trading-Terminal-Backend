import TreeNews from './newScrape/treeNews.js';
// import OpenAiAnalyze from './newScrape/chatgpt.js';
import NewScraper from './newScrape/newScrape.js';
import Upbit from './newScrape/upbit.js';

const main = async (): Promise<void> => {
  // const apiKey = process.env.OPENAI_API_KEY,
  //   prompt = process.env.CONTENT,
  const treeNews = new TreeNews(process.env.TREENEWS),
    // defaultNewsHeadline = 'SEC TO APPEAL RIPPLE RULING: FILING',
    sources = [
      {
        name: 'theBlock',
        url: 'https://www.theblock.co/latest',
        selector: '.headline',
      },
      {
        name: 'Coindesk',
        url: 'https://www.coindesk.com/',
        selector: '.live-wirestyles__Title-sc-1xrlfqv-3.fwiqHn',
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
    const upbit = new Upbit();
    await upbit.getListing();
  } catch (err) {
    console.error('Failed getting headlines: ', err);
  }
};

main();
