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
    console.log('updating data: ', response);
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
    const response = await pool.query(
      `SELECT apikey, apisecret FROM login WHERE email = $1`,
      [email],
    );
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
    console.log('checking openai: ', response);
    return response.rows[0];
  } catch (err) {
    console.error('Failed checking existing user open ai: ', err);
    throw err;
  }
};

// await createUser(process.env.EMAIL_LOGIN, process.env.PASSWORD);
export {
  checkExistingUser,
  createUser,
  updateApi,
  checkUserSubmitApi,
  updateOpenAi,
  checkUserSubmitOpenAiApi,
};
