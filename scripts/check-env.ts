/**
 * Environment Variable Checker Script
 * 
 * This script verifies that all required environment variables for HyperScribe are present.
 * Run it to diagnose issues with environment variable loading:
 * pnpm tsx scripts/check-env.ts
 */

import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
const result = config({
  path: '.env.local',
});

console.log('=== HyperScribe Environment Check ===\n');

// Check if .env.local was loaded
if (result.error) {
  console.error('❌ Failed to load .env.local file:', result.error.message);
  console.log('Working directory:', process.cwd());
  console.log('Looking for:', path.join(process.cwd(), '.env.local'));
  console.log('\nFile exists?', fs.existsSync(path.join(process.cwd(), '.env.local')) ? 'Yes' : 'No');
} else {
  console.log('✅ .env.local file loaded successfully');
}

// Required environment variables
const requiredVars = [
  'POSTGRES_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'AUTH_SECRET',
];

// Check each required variable
let allPresent = true;
console.log('\n=== Required Variables ===');

for (const varName of requiredVars) {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${process.env[varName].substring(0, 5)}...${process.env[varName].substring(process.env[varName].length - 5)}`);
  } else {
    console.log(`❌ ${varName}: NOT FOUND`);
    allPresent = false;
  }
}

// Optional environment variables
const optionalVars = [
  'OPENAI_API_KEY',
  'DEEPGRAM_API_KEY',
  'FIREWORKS_API_KEY',
  'GROQ_API_KEY',
  'BLOB_READ_WRITE_TOKEN',
];

console.log('\n=== Optional Variables ===');

for (const varName of optionalVars) {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: ${process.env[varName].substring(0, 5)}...${process.env[varName].substring(process.env[varName].length - 5)}`);
  } else {
    console.log(`⚠️ ${varName}: NOT FOUND`);
  }
}

// Summary
console.log('\n=== Summary ===');
if (allPresent) {
  console.log('✅ All required environment variables are present.');
  console.log('You should be able to run the application and database commands without issues.');
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('Please make sure all required variables are defined in your .env.local file.');
  console.log('Try copying them from .env.example and filling in the correct values.');
}

console.log('\nFor more information, see the README.md file.'); 