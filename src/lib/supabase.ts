import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function uploadRecording(
  file: Blob,
  fileName: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from("recordings")
    .upload(fileName, file, { contentType: "video/webm" });

  if (error) throw error;

  const { data: publicUrl } = supabaseAdmin.storage
    .from("recordings")
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
