import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple util to safely extract JSON from model output (handles code fences)
function extractJson(text: string): any | null {
  try {
    const trimmed = text.trim();
    const jsonBlock = trimmed
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();
    return JSON.parse(jsonBlock);
  } catch (_) {
    return null;
  }
}

async function callGemini(systemPrompt: string, userMessage: string, conversationHistory?: any[]) {
  const apiKey =
    Deno.env.get('GEMINI_API_KEY') ||
    Deno.env.get('GOOGLE_API_KEY') ||
    Deno.env.get('GOOGLE_GENAI_API_KEY') ||
    Deno.env.get('GOOGLE_GEMINI_API_KEY') ||
    Deno.env.get('GOOGLE_AI_STUDIO_API_KEY') ||
    Deno.env.get('GENAI_API_KEY') ||
    Deno.env.get('GEMINI_KEY');
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY (also checked GOOGLE_API_KEY/GOOGLE_GENAI_API_KEY/GOOGLE_GEMINI_API_KEY/GOOGLE_AI_STUDIO_API_KEY/GENAI_API_KEY/GEMINI_KEY)');
  }

  const historyText = Array.isArray(conversationHistory) && conversationHistory.length
    ? `Conversation history (last ${Math.min(conversationHistory.length, 10)} messages):\n${JSON.stringify(conversationHistory.slice(-10))}\n\n`
    : '';

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n${historyText}User message:\n${userMessage}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 800
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = Array.isArray(parts) ? parts.map((p: any) => p.text || '').join('') : (data?.candidates?.[0]?.content?.parts?.[0]?.text || '');
  return text as string;
}

function buildSystemPrompt() {
  return `You are a professional AI assistant for an employee scheduling system.

Personality & Tone:
- Friendly, professional, clear, concise, supportive
- Respectful and fact-based, human-like conversational flow

Account Types you recognize: Administrator, Payroll Administrator, Employee
Core Modules you can reference: Attendance, Leave Management, Schedule Requests, Payroll, Payroll Dashboard, Payroll Reports, Payslips, Shift Calendar, Employee Rotas, Employee Workflow, Manager Time Clock

Your Roles:
- General Q&A: Answer policies, procedures, or unrelated topics professionally in natural language.
- Backend logic assistant: Help with shift publishing, conflict detection, shift swaps, and compliance tracking (late arrivals, overtime, no-shows).

Routing map for backend tasks (do not invent new routes):
- /api/shifts/publish
- /api/shifts/conflict-check
- /api/shifts/swap
- /api/shifts/track
- /api/shifts/overtime-log

Response rules:
- Keep all responses concise and practical.
- For General Q&A: respond in plain text only (no code fences or markdown blocks).
- For backend tasks: return JSON only (no preamble, no extra text). Use strict, valid JSON.
- Use ISO formats: date YYYY-MM-DD, time HH:mm (24h). Keep field names lowercase with underscores.
- If any required input is missing, ask one brief clarifying question first.

Payload schemas and expectations:
- Publish a single shift → respond with:
  {"route":"/api/shifts/publish","payload":{"employee_id":"uuid","date":"YYYY-MM-DD","start_time":"HH:mm","end_time":"HH:mm","role":"string","location":"string"},"status":"ready"}
- Conflict detection → detect overlap where start_time < other_end AND end_time > other_start. Respond with either:
  {"route":"/api/shifts/conflict-check","payload":{"employee_id":"uuid","date":"YYYY-MM-DD","start_time":"HH:mm","end_time":"HH:mm","location":"string"},"status":"ready"}
  or, if analysis requested, include results:
  {"route":"/api/shifts/conflict-check","conflict_details":[{"conflict_with":"shift_id_or_summary","overlap_minutes":number,"reason":"employee|location"}],"status":"analyzed"}
- Shift swap validation → ensure both employees can cover each other's shifts. Respond with:
  {"route":"/api/shifts/swap","payload":{"from_employee_id":"uuid","to_employee_id":"uuid","from_shift":{"date":"YYYY-MM-DD","start_time":"HH:mm","end_time":"HH:mm","location":"string"},"to_shift":{"date":"YYYY-MM-DD","start_time":"HH:mm","end_time":"HH:mm","location":"string"}},"status":"ready"}
- Compliance tracking (clock in/out comparisons) → respond with:
  {"route":"/api/shifts/track","payload":{"employee_id":"uuid","action":"clock_in|clock_out","date":"YYYY-MM-DD","timestamp":"ISO-8601"},"flags":{"late_clock_in":boolean,"early_leave":boolean,"no_show":boolean,"overtime":boolean},"status":"ready"}
- Overtime logging → respond with:
  {"route":"/api/shifts/overtime-log","payload":{"employee_id":"uuid","date":"YYYY-MM-DD","minutes":number},"status":"ready"}

Style:
- Prefer short bullet points when listing steps.
- No code fences, no markdown blocks, plain text or pure JSON as specified.`;
}

function summarizeAction(action: any): string {
  try {
    const route = action?.route || '';
    const status = action?.status || 'unknown';
    if (route.includes('/publish')) {
      const p = action.payload || {};
      return `Prepared shift publish for ${p.employee_id || 'employee'} on ${p.date || '?'} ${p.start_time || '?'}-${p.end_time || '?'} at ${p.location || '?'} (status: ${status}).`;
    }
    if (route.includes('/conflict-check')) {
      return `Conflict check ${status}${action.conflict_details?.length ? `: ${action.conflict_details.length} potential issues` : ''}.`;
    }
    if (route.includes('/swap')) {
      const p = action.payload || {};
      return `Evaluated shift swap between ${p.from_employee_id || '?'} and ${p.to_employee_id || '?'} (status: ${status}).`;
    }
    if (route.includes('/track')) {
      const p = action.payload || {};
      return `Recorded attendance intent ${p.action || '?'} for ${p.employee_id || 'employee'} on ${p.date || '?'} (status: ${status}).`;
    }
    if (route.includes('/overtime-log')) {
      const p = action.payload || {};
      return `Logged overtime of ${p.minutes || '?'} minutes for ${p.employee_id || 'employee'} on ${p.date || '?'} (status: ${status}).`;
    }
    return `Processed request (status: ${status}).`;
  } catch {
    return 'Processed request.';
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = buildSystemPrompt();

    let modelText = '';
    try {
      modelText = await callGemini(systemPrompt, message, conversationHistory);
    } catch (geminiErr) {
      console.error('Gemini call failed:', geminiErr);
      const missingSecret = String(geminiErr).toLowerCase().includes('missing gemini_api_key');
      const response = "I'm having trouble reaching the AI service right now. Please try again in a moment.";
      return new Response(
        JSON.stringify({ response, note: 'gemini_error_fallback', gemini_error: String(geminiErr), needs_secret: missingSecret }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseText = (modelText || '').trim();
    return new Response(
      JSON.stringify({ response: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
