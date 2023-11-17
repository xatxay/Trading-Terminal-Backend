import pool from './newPool.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createDb = async (fileName: string): Promise<void> => {
  try {
    const path = `${__dirname}/${fileName}`;
    const setupDb = await readFile(path, { encoding: 'utf-8' });
    await pool.query(setupDb);
    console.log('Created login database successfully');
  } catch (err) {
    console.error('Error creating login database: ', err);
  }
};

export default createDb;
