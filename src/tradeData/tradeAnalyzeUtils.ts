import pool from '../login/newPool.js';
import { UserLogin } from '../interface.js';

const selectUser = async (username: string): Promise<UserLogin> => {
  const result = await pool.query(`SELECT * FROM login WHERE username = $1`, [
    username,
  ]);
  const user = result.rows[0];
  console.log('select user: ', user, typeof user);
  return user;
};

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
  partial: string,
  pnl: string | number,
  outcome: string,
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO trade_data (news_id, time_stamp, ticker, side, entry, partial, pnl,  outcome) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, timeStamp, ticker, side, entry, partial, pnl, outcome],
    );
  } catch (err) {
    console.error('Error inserting into trade_data: ', err);
  }
};

const updateTradeOutcome = async (
  entry: string,
  partial: string,
  pnl: string,
  outcome: string,
  timeStamp: string,
  ticker: string,
  side: string,
): Promise<void> => {
  try {
    await pool.query(
      `UPDATE trade_data SET entry = $1, partial = $2, pnl = $3, outcome = $4 WHERE time_stamp = $5 AND ticker = $6 AND side = $7`,
      [entry, partial, pnl, outcome, timeStamp, ticker, side],
    );
  } catch (err) {
    console.error('Error updating trade_data: ', err);
  }
};

export {
  insertChatGptSentiment,
  insertNewsHeadline,
  insertTradeData,
  updateTradeOutcome,
  selectUser,
};
