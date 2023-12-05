import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { CheckApiData, CheckOpenAi } from '../interface.js';
import pool from './newPool.js';

dotenv.config();

const createUser = async (email: string, password: string): Promise<void> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `
        INSERT INTO login (email, password) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING
        `,
      [email, hashedPassword],
    );
  } catch (err) {
    console.error('Error inserting email and password: ', err);
  }
};

const checkExistingUser = async (email: string): Promise<number> => {
  try {
    const result = await pool.query(`SELECT * FROM login WHERE email = $1`, [
      email,
    ]);
    return result.rowCount;
  } catch (err) {
    console.error('Error checking existing user: ', err);
    throw err;
  }
};

const updateApi = async (
  email: string,
  apiKey: string,
  apiSecret: string,
): Promise<number> => {
  try {
    const response = await pool.query(
      `UPDATE login SET apiKey = $1, apiSecret = $2 WHERE email = $3`,
      [apiKey, apiSecret, email],
    );
    console.log('updating bybit api data: ', response.rowCount);
    return response.rowCount;
  } catch (err) {
    console.log('Error updating api data: ', err);
    throw err;
  }
};

const updateOpenAi = async (
  email: string,
  openAiApi: string,
): Promise<number> => {
  try {
    const response = await pool.query(
      `UPDATE login SET openai = $1 WHERE email = $2`,
      [openAiApi, email],
    );
    console.log('update openai: ', email, openAiApi);
    return response.rowCount;
  } catch (err) {
    console.log('Error updating openai: ', err);
    throw err;
  }
};

const checkUserSubmitApi = async (email: string): Promise<CheckApiData> => {
  try {
    console.log('check email: ', email);
    const response = await pool.query(
      `SELECT apikey, apisecret FROM login WHERE email = $1`,
      [email],
    );
    console.log('checkyser: ', response.rows[0]);
    return response.rows[0];
  } catch (err) {
    console.log('Failed checking existing user api: ', err);
    throw err;
  }
};

const checkUserSubmitOpenAiApi = async (
  email: string,
): Promise<CheckOpenAi> => {
  try {
    const response = await pool.query(
      `SELECT openai FROM login WHERE email = $1`,
      [email],
    );
    console.log('checking openai: ', response.rows[0]);
    return response.rows[0];
  } catch (err) {
    console.error('Failed checking existing user open ai: ', err);
    throw err;
  }
};

const selectApiWithId = async (id: number): Promise<CheckApiData> => {
  try {
    const userId = id.toString();
    const response = await pool.query(
      `SELECT apikey, apisecret FROM login WHERE id = $1`,
      [userId],
    );
    return response.rows[0];
  } catch (err) {
    console.error('Failed getting api data with user id: ', err);
    throw err;
  }
};

const selectOpenAiWithId = async (id: number): Promise<string> => {
  try {
    const userId = id.toString();
    const response = await pool.query(
      `SELECT openai FROM login WHERE id = $1`,
      [userId],
    );
    return response.rows[0].openai;
  } catch (err) {
    console.error('Error getting openai with id: ', err);
    throw err;
  }
};

// const updatePositionSize = async (
//   email: string,
//   firstPositionSize: string,
//   secondPositionSize: string,
// ): Promise<void> => {
//   try {
//     const response = await pool.query(
//       `UPDATE position_size SET firstPosition = $1, secondPosition = #2 WHERE email = $3`,
//       [firstPositionSize, secondPositionSize, email],
//     );
//     console.log('updating position: ', response);
//   } catch (err) {
//     console.error('Error updating position size: ', err);
//   }
// };

export {
  checkExistingUser,
  createUser,
  updateApi,
  checkUserSubmitApi,
  updateOpenAi,
  checkUserSubmitOpenAiApi,
  selectApiWithId,
  selectOpenAiWithId,
  // updatePositionSize,
};
