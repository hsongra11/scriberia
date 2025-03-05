import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { createStorageBuckets } from '@/lib/storage';

config({
  path: '.env.local',
});

// Function to run migrations directly (used for CLI commands)
const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  
  // Initialize storage buckets
  try {
    console.log('⏳ Initializing storage buckets...');
    await createStorageBuckets();
    console.log('✅ Storage buckets initialized!');
  } catch (error) {
    console.error('❌ Storage initialization failed!', error);
    console.log('This might be expected if running locally without Supabase credentials.');
  }
  
  process.exit(0);
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrate().catch((err) => {
    console.error('❌ Migration failed');
    console.error(err);
    process.exit(1);
  });
}

// Export functions for programmatic use in the application
export async function initializeStorage() {
  console.log('⏳ Initializing storage buckets...');
  
  try {
    await createStorageBuckets();
    console.log('✅ Storage buckets initialized!');
  } catch (error) {
    console.error('❌ Storage initialization failed!', error);
    console.log('This might be expected if running locally without Supabase credentials.');
  }
}
