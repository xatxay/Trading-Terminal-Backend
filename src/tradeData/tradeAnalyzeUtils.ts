import pool from '../login/newPool.js';

const insertNewsHeadline = async (
  id: string,
  title: string,
  newsHeadline: string,
  url: string,
  link: string,
  time: string,
  suggestions: string[],
  body: string,
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO news_headline (_id, title, newsHeadline, url, link, time, suggestions, body) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, title, newsHeadline, url, link, time, suggestions, body],
    );
    console.log('Inserting news headline');
  } catch (err) {
    console.error('Error inserting into news_headline: ', err);
  }
};

const insertChatGptSentiment = async (
  id: string,
  timeStamp: string,
  ticker: string,
  sentiment: string | number,
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO chatgpt_sentiment (news_id, time_stamp, ticker, sentiment) VALUES ($1, $2, $3, $4)`,
      [id, timeStamp, ticker, sentiment],
    );
  } catch (err) {
    console.error('Error inserting into chatgpt_sentiment: ', err);
  }
};

const insertTradeData = async (
  id: string,
  timeStamp: number,
  ticker: string,
  side: string,
  entry: string | number,
  pnl: string | number,
  outcome: string,
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO trade_data (news_id, time_stamp, ticker, side, entry, pnl,  outcome) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, timeStamp, ticker, side, entry, pnl, outcome],
    );
  } catch (err) {
    console.error('Error inserting into trade_data: ', err);
  }
};

export { insertChatGptSentiment, insertNewsHeadline, insertTradeData };
