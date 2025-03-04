'use server';

import { initializeApp } from '@/lib/init';

export async function AppInitializer() {
  try {
    // Only run in production to avoid issues in development with hot reloading
    if (process.env.NODE_ENV === 'production') {
      await initializeApp();
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
  
  // This component doesn't render anything
  return null;
}