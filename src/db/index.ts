import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('DATABASE_URL not set. Database features disabled. Using in-memory/localStorage only.');
    return null;
  }

  try {
    const pool = mysql.createPool(connectionString);
    db = drizzle(pool, { schema, mode: 'default' });
    return db;
  } catch (error) {
    console.error('Failed to connect to MySQL:', error);
    return null;
  }
}

export { schema };