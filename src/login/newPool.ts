import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES,
});
console.log(process.env.POSTGRES);
export default pool;
