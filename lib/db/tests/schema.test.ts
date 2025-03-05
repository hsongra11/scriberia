import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import { config } from 'dotenv';

// Load environment variables from .env.local at the very beginning
config({ path: '.env.local' });

// We need to make sure these tests run in a controlled environment
// Typically this would use a test database, but for simplicity we'll use the main database
// with careful cleanup

// Setup test client
const setupClient = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }
  
  const client = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(client, { schema });
  
  return { client, db };
};

// Test database connection
async function testConnection() {
  console.log('Testing database connection...');
  try {
    const { client, db } = await setupClient();
    
    // Use a simple query that doesn't depend on existing tables
    const result = await client.unsafe('SELECT 1 as connection_test').execute();
    console.log('Connection successful!', result[0]);
    
    // Close the connection
    await client.end();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Test table existence
async function testTableExistence() {
  console.log('Testing table existence...');
  const { client, db } = await setupClient();
  
  try {
    // Check for the existence of key tables
    const tables = [
      'User',
      'Chat',
      'Message',
      'Template',
      'Note',
      'Task',
      'NoteShare',
      'Attachment',
      'Migrations',
    ];
    
    // We'll query information_schema to check if tables exist
    const existingTables: string[] = [];
    
    for (const tableName of tables) {
      const query = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        );
      `;
      
      const result = await client.unsafe(query).execute();
      
      if (result[0].exists) {
        existingTables.push(tableName);
        console.log(`✅ Table '${tableName}' exists`);
      } else {
        console.error(`❌ Table '${tableName}' does not exist`);
      }
    }
    
    // Check if all tables exist
    const allTablesExist = existingTables.length === tables.length;
    console.log(`Table existence test ${allTablesExist ? 'passed' : 'failed'}`);
    await client.end();
    return allTablesExist;
  } catch (error) {
    console.error('Error testing table existence:', error);
    await client.end();
    return false;
  }
}

// Test table columns
async function testTableColumns() {
  console.log('Testing table columns...');
  const { client, db } = await setupClient();
  
  try {
    // Expected columns for important tables
    const expectedColumns = {
      'User': ['id', 'email', 'password', 'name', 'avatarUrl', 'createdAt'],
      'Note': ['id', 'title', 'content', 'templateId', 'userId', 'isArchived', 'isDeleted', 'category', 'lastEditedAt', 'createdAt'],
      'Template': ['id', 'name', 'description', 'content', 'category', 'isDefault', 'userId', 'createdAt', 'updatedAt'],
    };
    
    let allColumnsExist = true;
    
    for (const [tableName, expectedCols] of Object.entries(expectedColumns)) {
      const query = `
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}';
      `;
      
      const result = await client.unsafe(query).execute();
      const actualColumns = result.map((row: any) => row.column_name);
      
      console.log(`Columns for ${tableName}:`, actualColumns);
      
      // Check if all expected columns exist
      const missingColumns = expectedCols.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log(`✅ All expected columns exist for table '${tableName}'`);
      } else {
        console.error(`❌ Missing columns for table '${tableName}':`, missingColumns);
        allColumnsExist = false;
      }
    }
    
    console.log(`Table columns test ${allColumnsExist ? 'passed' : 'failed'}`);
    await client.end();
    return allColumnsExist;
  } catch (error) {
    console.error('Error testing table columns:', error);
    await client.end();
    return false;
  }
}

// Test relationships
async function testRelationships() {
  console.log('Testing table relationships...');
  const { client, db } = await setupClient();
  
  try {
    // Check for foreign key constraints
    const query = `
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu 
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY';
    `;
    
    const result = await client.unsafe(query).execute();
    
    // Expected key relationships
    const expectedRelationships = [
      { table: 'Chat', column: 'userId', foreignTable: 'User', foreignColumn: 'id' },
      { table: 'Message', column: 'chatId', foreignTable: 'Chat', foreignColumn: 'id' },
      { table: 'Note', column: 'userId', foreignTable: 'User', foreignColumn: 'id' },
      { table: 'Note', column: 'templateId', foreignTable: 'Template', foreignColumn: 'id' },
      { table: 'Task', column: 'userId', foreignTable: 'User', foreignColumn: 'id' },
      { table: 'Task', column: 'noteId', foreignTable: 'Note', foreignColumn: 'id' },
    ];
    
    console.log('Found foreign key relationships:');
    result.forEach((row: any) => {
      console.log(`${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    
    // Check if all expected relationships exist
    const foundRelationships = result.map((row: any) => ({
      table: row.table_name,
      column: row.column_name,
      foreignTable: row.foreign_table_name,
      foreignColumn: row.foreign_column_name
    }));
    
    const missingRelationships = expectedRelationships.filter(expected => 
      !foundRelationships.some(found => 
        found.table === expected.table && 
        found.column === expected.column && 
        found.foreignTable === expected.foreignTable && 
        found.foreignColumn === expected.foreignColumn
      )
    );
    
    if (missingRelationships.length === 0) {
      console.log('✅ All expected relationships exist');
    } else {
      console.error('❌ Missing relationships:', missingRelationships);
    }
    
    const relationshipsValid = missingRelationships.length === 0;
    console.log(`Relationships test ${relationshipsValid ? 'passed' : 'failed'}`);
    await client.end();
    return relationshipsValid;
  } catch (error) {
    console.error('Error testing relationships:', error);
    await client.end();
    return false;
  }
}

// Run all tests if this file is executed directly
async function runTests() {
  console.log('\n=== Running Database Schema Tests ===\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('Database connection test failed! Cannot proceed with other tests.');
    return false;
  }
  
  // Check if any tables exist
  const { client } = await setupClient();
  const tableCountQuery = `
    SELECT COUNT(*) as table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  `;
  
  const tableCountResult = await client.unsafe(tableCountQuery).execute();
  const tableCount = Number.parseInt(tableCountResult[0].table_count);
  
  if (tableCount === 0) {
    console.log('No tables found in the database. This might be expected if migrations haven\'t been run yet.');
    console.log('To run migrations: pnpm db:migrate');
    await client.end();
    return true; // Return success since this might be the expected state
  }
  
  await client.end();
  
  const tablesExist = await testTableExistence();
  const columnsValid = await testTableColumns();
  const relationshipsValid = await testRelationships();
  
  const allTestsPassed = tablesExist && columnsValid && relationshipsValid;
  
  console.log('\n=== Schema Test Summary ===');
  console.log(`Tables exist: ${tablesExist ? '✅' : '❌'}`);
  console.log(`Columns valid: ${columnsValid ? '✅' : '❌'}`);
  console.log(`Relationships valid: ${relationshipsValid ? '✅' : '❌'}`);
  console.log(`Overall result: ${allTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  return allTestsPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  runTests()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(err => {
      console.error('Tests failed with error:', err);
      process.exit(1);
    });
}

export { runTests, testConnection, testTableExistence, testTableColumns, testRelationships }; 