import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder"
);

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey);
}

export async function uploadRecording(
  file: Blob,
  fileName: string
): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

  const { data, error } = await supabaseAdmin.storage
    .from("recordings")
    .upload(fileName, file, { contentType: "video/webm" });

  if (error) throw error;

  const { data: publicUrl } = supabaseAdmin.storage
    .from("recordings")
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
