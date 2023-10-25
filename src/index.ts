import TreeNews from './newScrape/treeNews.js';
import Headlines from './newScrape/getHeadline.js';

const main = async (): Promise<void> => {
  const sources = [
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
  const treeNews = new TreeNews(process.env.TREENEWS);
  treeNews.startPing();

  try {
    for (const source of sources) {
      const headlinesService = new Headlines(source.url);
      const headlines = await headlinesService.get(source.selector);
      console.log(`${source.name}:\n`, headlines[0]);
    }
  } catch (err) {
    console.error('Failed getting headlines: ', err);
  }
};

main();
