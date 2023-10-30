import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createProxyDatabase = async (fileName: string): Promise<void> => {
  try {
    console.log('DIR: ', __dirname);
    const setUpDatabase = fs.readFileSync(
      path.resolve(__dirname, fileName),
      'utf-8',
    );
    await pool.query(setUpDatabase);
    console.log('Create database successful');
  } catch (err) {
    console.error('Failed creating database: ', err);
  }
};

export default createProxyDatabase;
