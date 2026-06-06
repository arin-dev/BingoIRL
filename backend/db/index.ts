import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

function getDbConfig(): mysql.PoolOptions {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Missing required DB_* environment variables');
  }
  return {
    host:     DB_HOST,
    port:     parseInt(DB_PORT),
    user:     DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl:      { rejectUnauthorized: false },
  };
}

const pool = mysql.createPool(getDbConfig());
export const db = drizzle(pool, { schema, mode: 'default' });
