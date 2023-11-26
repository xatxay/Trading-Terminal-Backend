import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile } from 'fs/promises';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createDb = async (fileName: string): Promise<void> => {
  try {
    const path = `${__dirname}/${fileName}`;
    const setupDb = await readFile(path, { encoding: 'utf-8' });
    await pool.query(setupDb);
    console.log(`Created ${fileName} database successfully`);
  } catch (err) {
    console.error(`Error creating ${fileName} database: `, err);
  }
};

await createDb('loginTable.sql');
await createDb('tradeAnalyze.sql');

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

const updateApi = async (email: string, apiKey: string, apiSecret: string) => {
  try {
    const response = await pool.query(
      `UPDATE login SET apiKey = $1, apiSecret = $2 WHERE email = $3`,
      [apiKey, apiSecret, email],
    );
    console.log('updating data: ', response);
  } catch (err) {
    console.log('Error updating api data: ', err);
  }
};

// await createUser(process.env.EMAIL_LOGIN, process.env.PASSWORD);
export { checkExistingUser, createUser, updateApi };
