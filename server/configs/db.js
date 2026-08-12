import { neon } from '@neondatabase/serverless';

const dbUrl = (process.env.DATABASE_URL || '').replace(/^['"]|['"]$/g, '').trim();

const sql = neon(dbUrl);

export default sql;

