import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables if running on server
if (typeof window === 'undefined') {
  config({ path: '.env.local' });
}

// Try to get Supabase URL with fallback for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://padmfskijkwobedspwrx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.warn('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.warn('Storage functionality may not work properly');
}

// Create Supabase client
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || '' // Fallback to empty string if null/undefined
);

// Create admin client with service role key (used for RLS bypassing)
export const getAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
    console.warn('Admin operations will not work properly');
    return supabaseClient; // Return regular client as fallback
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey
  );
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  AUDIO: 'audio-notes',
  IMAGES: 'note-images',
  ATTACHMENTS: 'note-attachments'
} as const; 