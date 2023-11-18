import bcrypt from 'bcryptjs';
import pool from './newPool.js';
import { UserLogin } from '../interface.js';

const createUser = async (
  username: string,
  password: string,
): Promise<void> => {
  try {
    console.log('username: ', username);
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

const selectUser = async (username: string): Promise<UserLogin> => {
  const result = await pool.query(`SELECT * FROM login WHERE username = $1`, [
    username,
  ]);
  const user = result.rows[0];
  console.log('select user: ', user, typeof user);
  return user;
};

export { createUser, selectUser };
