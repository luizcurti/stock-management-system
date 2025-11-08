import { DatabaseConfig } from './databaseConfig';
import mysql from 'mysql2';

const dbConfig = <DatabaseConfig>{
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 100,
  waitForConnections: true,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);
export const db = pool.promise();
