import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES,
});

export default pool;
