import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

// The HTTP driver cannot run interactive transactions. Marketplace workflows
// (quote acceptance and stock decrement) require a transaction-capable client.
export const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle({ client: pool, schema });
