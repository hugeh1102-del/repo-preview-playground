import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// The Android app loads from a local origin, so it calls this endpoint cross-origin.
const APP_ORIGINS = new Set(["https://localhost", "http://localhost", "capacitor://localhost"]);

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin || !APP_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const Body = z.object({ question: z.string().trim().min(3).max(2000) });

export const Route = createFileRoute("/api/public/illuminated-book")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }) => {
        const headers = corsHeaders(request);
        let question: string;
        try {
          question = Body.parse(await request.json()).question;
        } catch {
          return Response.json({ ok: false, error: "اكتب سؤالًا من ثلاثة أحرف على الأقل." }, { status: 400, headers });
        }
        const { askQuestion } = await import("@/lib/illuminated/ask.server");
        return Response.json(await askQuestion(question), { headers });
      },
    },
  },
});
