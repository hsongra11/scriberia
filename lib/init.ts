import { initializeStorage } from './db/migrate';

/**
 * Initialize the application
 * This function is called when the app starts
 */
export async function initializeApp() {
  try {
    // Initialize storage buckets
    await initializeStorage();
    
    console.log('✅ Application initialized successfully!');
  } catch (error) {
    console.error('❌ Application initialization failed!', error);
  }
} 