import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createProxyDatabase = async (fileName: string): Promise<void> => {
  try {
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

const insertProxy = async (): Promise<void> => {
  try {
    const proxies = [
      '166.1.14.148:50100:jametrades618:NngLeDgrDC',
      '149.51.71.208:7665:OR1669646137:SLrh2dPs',
    ];
    console.log('Inserted proxies to database');
    for (const proxy of proxies) {
      await pool.query(
        `INSERT INTO proxy (proxy) VALUES ($1) ON CONFLICT (proxy) DO NOTHING`,
        [proxy],
      );
    }
  } catch (err) {
    console.error('Failed inserting into the database: ', err);
  }
};

const selectProxy = async (): Promise<string[] | null> => {
  try {
    const result = await pool.query(`SELECT * FROM proxy`);
    if (result.rowCount > 0) {
      return result.rows.map((row) => row.proxy);
    }
    return null;
  } catch (err) {
    console.error('Failed selecting proxy: ', err);
    return null;
  }
};

export { createProxyDatabase, insertProxy, selectProxy };
