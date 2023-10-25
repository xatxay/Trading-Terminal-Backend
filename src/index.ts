import { getHeadline } from './newScrape/getHeadline.js';
import initializedWebsocket from './newScrape/treeNews.js';

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

  try {
    initializedWebsocket();
  } catch (err) {
    console.error('Failed connecting to tree news websocket: ', err);
  }

  try {
    for (const source of sources) {
      const headlines = await getHeadline(source.url, source.selector);
      console.log(`${source.name}:\n`, headlines[0]);
    }
  } catch (err) {
    console.error('Failed getting headlines: ', err);
  }
};

main();
