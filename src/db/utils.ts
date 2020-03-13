import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: "postgres://postgres:password@localhost:5432/postgres"
  });
  
export async function poolQuery(query_list) {
    return pool.query(query_list);
  }