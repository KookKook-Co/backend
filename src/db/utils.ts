import { Pool } from 'pg';

export async function poolQuery(pool: Pool, query_list) {
    return pool.query(query_list);
}
