import { supabaseClient, getAdminClient, STORAGE_BUCKETS } from './config';
import { generateUUID } from '@/lib/utils';

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile({
  file,
  bucketName,
  path = '',
  userId,
}: {
  file: File;
  bucketName: keyof typeof STORAGE_BUCKETS;
  path?: string;
  userId: string;
}) {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${path ? `${path}/` : ''}${generateUUID()}.${fileExt}`;
    
    // Upload the file
    const { data, error } = await supabaseClient.storage
      .from(STORAGE_BUCKETS[bucketName])
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    // Return the file URL and path
    const fileUrl = supabaseClient.storage
      .from(STORAGE_BUCKETS[bucketName])
      .getPublicUrl(data.path).data.publicUrl;
    
    return {
      url: fileUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile({
  bucketName,
  filePath,
}: {
  bucketName: keyof typeof STORAGE_BUCKETS;
  filePath: string;
}) {
  try {
    const { error } = await supabaseClient.storage
      .from(STORAGE_BUCKETS[bucketName])
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get a temporary signed URL for a file (useful for private files)
 */
export async function getSignedUrl({
  bucketName,
  filePath,
  expiresIn = 60, // seconds
}: {
  bucketName: keyof typeof STORAGE_BUCKETS;
  filePath: string;
  expiresIn?: number;
}) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(STORAGE_BUCKETS[bucketName])
      .createSignedUrl(filePath, expiresIn);
    
    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
}

/**
 * Create storage buckets (admin only function)
 * This should be run during setup
 */
export async function createStorageBuckets() {
  try {
    const adminClient = getAdminClient();
    
    for (const bucket of Object.values(STORAGE_BUCKETS)) {
      const { error } = await adminClient.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: bucket === STORAGE_BUCKETS.AUDIO ? 1024 * 1024 * 25 : 1024 * 1024 * 10, // 25MB for audio, 10MB for others
      });
      
      if (error && error.message !== 'Bucket already exists') {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    throw error;
  }
} 