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
  return (
    'System Role: You are the AI assistant for an employee scheduling system.\n' +
    'You ONLY respond with a strict JSON object, no prose, no markdown.\n' +
    'Understand user intent and map it to one of these backend routes and methods:\n' +
    '- POST /api/shifts/publish\n' +
    '- POST /api/shifts/conflict-check\n' +
    '- POST /api/shifts/swap\n' +
    '- POST /api/shifts/track\n' +
    '- POST /api/shifts/overtime-log\n' +
    '\n' +
    'Data expectations:\n' +
    '- Single Shift Publishing payload: { employee_id, date, start_time, end_time, role, location }\n' +
    '- Conflict Check payload: proposed shift details and any matching key fields (employee_id and/or location)\n' +
    '- Swap payload: { from_employee_id, to_employee_id, date, start_time, end_time, location } (adjust if context provides IDs of two shifts)\n' +
    '- Track payload (attendance): { employee_id, date, action: "clock_in"|"clock_out"|"break_start"|"break_end", timestamp?, notes? }\n' +
    '- Overtime Log payload: { employee_id, date, minutes, reason?, approved_by? }\n' +
    '\n' +
    'Statuses:\n' +
    '- "ready": sufficient data to proceed\n' +
    '- "missing_data": data needed is incomplete; include which fields are missing in payload under missing_fields array\n' +
    '- "conflict_detected": a conflict is present; add conflict_details array\n' +
    '- "swap_possible": both employees appear available; include both shift details\n' +
    '- "tracking_update": a valid attendance/compliance action\n' +
    '\n' +
    'Output format (strict JSON):\n' +
    '{\n' +
    '  "route": "/api/...",\n' +
    '  "method": "POST",\n' +
    '  "payload": { ... },\n' +
    '  "status": "ready" | "missing_data" | "conflict_detected" | "swap_possible" | "tracking_update",\n' +
    '  "conflict_details": [ ... ]\n' +
    '}\n' +
    '\n' +
    'Rules:\n' +
    '- Never include markdown or natural language commentary.\n' +
    '- If unsure, choose the closest route and set status to "missing_data" with missing_fields.\n' +
    '- Use ISO date (YYYY-MM-DD) and 24h time (HH:MM).\n'
  );
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
      // Fallback to basic heuristic if Gemini fails
      console.error('Gemini call failed:', geminiErr);
      const lower = message.toLowerCase();
      const fallback = lower.includes('swap')
        ? { route: '/api/shifts/swap', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['from_employee_id','to_employee_id','date','start_time','end_time','location'] }
        : lower.includes('conflict')
        ? { route: '/api/shifts/conflict-check', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['employee_id','date','start_time','end_time','location'] }
        : lower.includes('overtime')
        ? { route: '/api/shifts/overtime-log', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['employee_id','date','minutes'] }
        : lower.includes('clock') || lower.includes('attendance')
        ? { route: '/api/shifts/track', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['employee_id','date','action'] }
        : { route: '/api/shifts/publish', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['employee_id','date','start_time','end_time','role','location'] };

      const summary = summarizeAction(fallback);
      const missingSecret = String(geminiErr).includes('Missing GEMINI_API_KEY');
      return new Response(
        JSON.stringify({ response: summary, action: fallback, note: 'gemini_error_fallback', gemini_error: String(geminiErr), needs_secret: missingSecret }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = extractJson(modelText);
    if (!parsed || typeof parsed !== 'object') {
      console.warn('Model returned non-JSON or unparsable output:', modelText);
      // Graceful fallback to heuristic mapping instead of 502
      const lower = message.toLowerCase();
      const fallback = lower.includes('swap')
        ? { route: '/api/shifts/swap', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['from_employee_id','to_employee_id','date','start_time','end_time','location'] }
        : lower.includes('conflict')
        ? { route: '/api/shifts/conflict-check', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['employee_id','date','start_time','end_time','location'] }
        : lower.includes('overtime')
        ? { route: '/api/shifts/overtime-log', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['employee_id','date','minutes'] }
        : lower.includes('clock') || lower.includes('attendance')
        ? { route: '/api/shifts/track', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['employee_id','date','action'] }
        : { route: '/api/shifts/publish', method: 'POST', payload: {}, status: 'missing_data', conflict_details: [], missing_fields: ['employee_id','date','start_time','end_time','role','location'] };
      const summary = summarizeAction(fallback);
      return new Response(
        JSON.stringify({ response: summary, action: fallback, note: 'fallback_used' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const summary = summarizeAction(parsed);
    return new Response(
      JSON.stringify({ response: summary, action: parsed }),
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
