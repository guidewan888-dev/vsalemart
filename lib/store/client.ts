import { createClient } from "@supabase/supabase-js";
let instance: ReturnType<typeof createClient> | undefined;
export function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error("ยังไม่ได้เชื่อมต่อบริการบัญชี กรุณาลองอีกครั้งภายหลัง");
  return (instance ??= createClient(url, key));
}
export async function api(path: string, body?: unknown, method?: string) {
  const { data } = await authClient().auth.getSession();
  const response = await fetch("/api/store/" + path, {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(data.session
        ? { Authorization: "Bearer " + data.session.access_token }
        : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "ไม่สามารถดำเนินการได้");
  return result;
}
