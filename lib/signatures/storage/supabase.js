import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function uploadBufferToBucket(path, buffer, contentType = 'application/pdf') {
  const supabase = getSupabase();
  const bucket = process.env.SUPABASE_BUCKET || 'contracts';
  const { data, error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true
  });
  if (error) throw error;
  // Prefer signed URL for private buckets
  const signed = await supabase.storage.from(bucket).createSignedUrl(data.path, 60 * 60); // 1 hour
  if (signed.error) {
    // Fallback to public URL (if bucket is public)
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl.publicUrl;
  }
  return signed.data.signedUrl;
}

