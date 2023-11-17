import bcrypt from 'bcryptjs';
import pool from './newPool.js';

const createUser = async (
  username: string,
  password: string,
): Promise<void> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `
        INSERT INTO login (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING
        `,
      [username, hashedPassword],
    );
  } catch (err) {
    console.error('Error inserting username and password: ', err);
  }
};

export default createUser;
