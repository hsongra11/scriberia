import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Setup client
let client: ReturnType<typeof postgres> | undefined;
if (process.env.POSTGRES_URL) {
  client = postgres(process.env.POSTGRES_URL, { max: 1 });
} else {
  console.warn('POSTGRES_URL not set. Database connection will not be available.');
}

// Create and export the database connection
export const db = client ? drizzle(client) : null; 