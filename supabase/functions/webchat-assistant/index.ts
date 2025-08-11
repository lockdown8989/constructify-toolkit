import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { message, context, autoExecute = true } = await req.json();
    if (!message) return json({ error: "message is required" }, 400);

    // Build routing prompt
    const routingPrompt = `
You are an assistant for a workforce app. Determine intent from the user's message and produce strict JSON.
Intents and routes:
- publish -> /api/shifts/publish (edge action: publish)
- conflict-check -> /api/shifts/conflict-check (edge action: conflict-check)
- swap -> /api/shifts/swap (edge action: swap)
- track -> /api/shifts/track (edge action: track)
- overtime-log -> /api/shifts/overtime-log (edge action: overtime-log)

Return JSON:
{
  "recognized": boolean,
  "action": "publish"|"conflict-check"|"swap"|"track"|"overtime-log"|null,
  "payload": object, // minimal fields required
  "assistant_reply": string // concise reply for the user
}
User message: ${message}
Context: ${JSON.stringify(context ?? {})}
`;

    async function callGemini(prompt: string) {
      if (!GEMINI_API_KEY) return { parsed: null, note: "GEMINI_API_KEY not set" };
      const resp = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt + "\nReturn ONLY JSON." }] }],
            generationConfig: { temperature: 0.1 },
          }),
        },
      );
      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      if (!text) return { parsed: null, raw: data };
      try {
        const match = text.match(/```json\n([\s\S]*?)\n```/);
        const jsonStr = match ? match[1] : text;
        return { parsed: JSON.parse(jsonStr) };
      } catch (_) {
        return { parsed: null, raw: text };
      }
    }

    const route = await callGemini(routingPrompt);

    if (!route.parsed || route.parsed.recognized !== true || !route.parsed.action) {
      // Fallback: just answer conversationally
      const convPrompt = `You are a helpful rota assistant. Answer concisely in under 60 words.\nMessage: ${message}`;
      const convo = await callGemini(convPrompt);
      return json({
        success: true,
        mode: "conversational",
        reply: route.parsed?.assistant_reply || convo.parsed || convo.raw || "How can I help with schedules and rotas?",
      });
    }

    // If recognized, optionally execute against shifts-api
    let execution: any = null;
    if (autoExecute === true) {
      const payload = route.parsed.payload ?? {};
      const { data, error } = await supabase.functions.invoke("shifts-api", {
        body: { action: route.parsed.action, ...payload },
      });
      execution = { data, error: error ? error.message : null };
    }

    return json({
      success: true,
      mode: "routed",
      action: route.parsed.action,
      payload: route.parsed.payload ?? {},
      reply: route.parsed.assistant_reply ?? "Action prepared.",
      result: execution,
    });
  } catch (e) {
    console.error("webchat-assistant error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
