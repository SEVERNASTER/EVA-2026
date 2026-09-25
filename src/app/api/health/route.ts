import { hasPublicSupabaseEnv } from "@/lib/env";

export async function GET() {
  return Response.json({
    ok: true,
    app: "eva-2026",
    supabaseConfigured: hasPublicSupabaseEnv(),
  });
}
