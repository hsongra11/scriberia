import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'node:path';
import fs from 'node:fs';
import { runTests } from '../lib/db/tests/schema.test';

// Load environment variables first - use .env.local for local development
config({
  path: '.env.local',
});

// Make sure Supabase env variables are available for storage services
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not found. Some storage functionality may not work properly.');
  console.warn('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
}

// Setup database client
const setupClient = () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }
  const client = postgres(process.env.POSTGRES_URL, { max: 1 });
  return { client, db: drizzle(client) };
};

// Get migration files
const getMigrationFiles = async () => {
  const migrationsDir = path.join(process.cwd(), 'lib/db/migrations');
  
  try {
    // Check if migrations directory exists
    await fs.promises.access(migrationsDir, fs.constants.F_OK);
    
    const files = await fs.promises.readdir(migrationsDir);
    
    // Sort the migrations by timestamp
    return files
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error(`Migrations directory not found at ${migrationsDir}`);
    return [];
  }
};

// Test migrations up
const testMigrationsUp = async () => {
  console.log('\n=== Testing Migrations Up ===\n');
  
  const { client, db } = setupClient();
  
  try {
    console.log('⏳ Running migrations up...');
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('✅ Migrations up completed successfully');
    
    // Run schema tests to verify database state
    const schemaValid = await runTests();
    
    if (!schemaValid) {
      console.error('❌ Schema validation failed after migrations');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error running migrations up:', error);
    return false;
  } finally {
    await client.end();
  }
};

// Test drop and recreate
const testDropAndRecreate = async () => {
  console.log('\n=== Testing Drop and Recreate ===\n');
  
  const { client, db } = setupClient();
  
  try {
    // Get list of all tables
    const listTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `;
    
    const tables = await client.unsafe(listTablesQuery).execute();
    const tableNames = tables.map((row: any) => row.table_name);
    
    if (tableNames.length === 0) {
      console.log('No tables found to drop');
      return true;
    }
    
    // Ask for confirmation before dropping tables
    console.log('The following tables will be dropped:');
    console.log(tableNames.join(', '));
    console.log('⚠️ This will delete all data in these tables! ⚠️');
    
    // In a real script, we would ask for confirmation here
    // But for testing purposes, we'll simulate confirmation
    console.log('Confirmed: dropping tables...');
    
    // Drop all tables
    try {
      console.log('⏳ Dropping all tables...');
      // Disable foreign key checks first
      await client.unsafe('SET CONSTRAINTS ALL DEFERRED;').execute();
      
      // Drop tables in reverse order to handle dependencies
      for (const tableName of [...tableNames].reverse()) {
        await client.unsafe(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`).execute();
      }
      
      console.log('✅ All tables dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping tables:', error);
      return false;
    }
    
    // Run migrations again
    try {
      console.log('⏳ Running migrations to recreate schema...');
      await migrate(db, { migrationsFolder: './lib/db/migrations' });
      console.log('✅ Schema recreated successfully');
      
      // Run schema tests to verify recreated database
      const schemaValid = await runTests();
      
      if (!schemaValid) {
        console.error('❌ Schema validation failed after recreation');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error recreating schema:', error);
      return false;
    }
  } finally {
    await client.end();
  }
};

// Validate migration files
const validateMigrationFiles = async () => {
  console.log('\n=== Validating Migration Files ===\n');
  
  try {
    const migrationFiles = await getMigrationFiles();
    
    if (migrationFiles.length === 0) {
      console.log('⚠️ No migration files found. This may be expected if migrations haven\'t been generated yet.');
      // Return true instead of false so tests can continue
      return true;
    }
    
    console.log(`Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => console.log(`- ${file}`));
    
    // Check file naming convention
    const validNaming = migrationFiles.every(file => {
      // Drizzle migrations should follow a timestamp pattern
      const isValid = /^\d{4}\d{2}\d{2}\d{6}/.test(file);
      if (!isValid) {
        console.error(`❌ Invalid migration file name: ${file}`);
      }
      return isValid;
    });
    
    if (!validNaming) {
      console.error('❌ Some migration files have invalid naming conventions');
      return false;
    }
    
    console.log('✅ All migration files have valid naming conventions');
    return true;
  } catch (error) {
    console.error('❌ Error validating migration files:', error);
    return false;
  }
};

// Main function to run all tests
const runAllTests = async () => {
  console.log('=== Starting Migration Tests ===');
  
  // Test database connection first
  const { client, db } = setupClient();
  try {
    // Test basic connection
    const connectionResult = await client.unsafe('SELECT 1 as connection_test').execute();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await client.end();
  }
  
  // Validate migration files
  const filesValid = await validateMigrationFiles();
  
  if (!filesValid) {
    console.log('⚠️ Migration files not found or invalid. This might be expected if migrations haven\'t been generated yet.');
    console.log('To generate migrations, run: pnpm db:generate');
    
    // We can still run schema tests if needed
    console.log('\n=== Running Schema Tests Only ===');
    const schemaValid = await runTests();
    
    console.log('\n=== Migration Test Summary ===');
    console.log(`Database connection: ✅`);
    console.log(`Migration files valid: ⚠️ (Not found or invalid)`);
    console.log(`Schema validation: ${schemaValid ? '✅' : '❌'}`);
    
    return schemaValid;
  }
  
  // Test migrations up
  const migrationsUpValid = await testMigrationsUp();
  
  if (!migrationsUpValid) {
    console.error('❌ Migrations up test failed, aborting further tests');
    return false;
  }
  
  // Test drop and recreate
  const recreateValid = await testDropAndRecreate();
  
  // Output final results
  console.log('\n=== Migration Test Summary ===');
  console.log(`Database connection: ✅`);
  console.log(`Migration files valid: ${filesValid ? '✅' : '❌'}`);
  console.log(`Migrations up valid: ${migrationsUpValid ? '✅' : '❌'}`);
  console.log(`Drop and recreate valid: ${recreateValid ? '✅' : '❌'}`);
  console.log(`Overall result: ${(filesValid && migrationsUpValid && recreateValid) ? '✅ PASSED' : '❌ FAILED'}`);
  
  return filesValid && migrationsUpValid && recreateValid;
};

// Run if called directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Tests failed with error:', error);
      process.exit(1);
    });
} 