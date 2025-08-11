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

// Helpers
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const bad = (message: string, status = 400) => json({ success: false, message }, status);

function getActionFromUrl(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const idx = parts.findIndex((p) => p === "shifts-api");
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : ""; // e.g. publish | conflict-check | swap | track | overtime-log
  } catch {
    return "";
  }
}

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    return { note: "GEMINI_API_KEY not set", output: null };
  }
  try {
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${prompt}\nReturn strictly JSON in your final answer.` },
              ],
              role: "user",
            },
          ],
          generationConfig: {
            temperature: 0.1,
          },
        }),
      }
    );
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    let parsed = null;
    if (text) {
      try {
        // Extract JSON block if wrapped in markdown
        const match = text.match(/```json\n([\s\S]*?)\n```/);
        parsed = JSON.parse(match ? match[1] : text);
      } catch {
        parsed = { raw: text };
      }
    }
    return { output: parsed };
  } catch (e) {
    console.error("Gemini call failed", e);
    return { error: String(e) };
  }
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  return aS < bE && bS < aE; // strict overlap
}

async function handlePublish(body: any) {
  const { employee_id, date, start_time, end_time, role, location } = body || {};
  if (!employee_id || !date || !start_time || !end_time) {
    return bad("employee_id, date, start_time, end_time are required");
  }
  const startIso = new Date(`${date}T${start_time}:00`).toISOString();
  const endIso = new Date(`${date}T${end_time}:00`).toISOString();

  // Check conflicts for the same employee
  const { data: existing, error: selErr } = await supabase
    .from("schedules")
    .select("id, employee_id, title, start_time, end_time, location, status")
    .eq("employee_id", employee_id)
    .or(`status.eq.confirmed,status.eq.pending,status.eq.employee_accepted`);

  if (selErr) return bad(`Failed to load schedules: ${selErr.message}`, 500);

  const empConflicts = (existing || []).filter((s) =>
    overlaps(startIso, endIso, s.start_time, s.end_time)
  );

  if (empConflicts.length > 0) {
    return json({
      success: false,
      action: "publish",
      conflict: true,
      conflict_details: empConflicts,
    }, 200);
  }

  // Insert the shift
  const title = role ? `${role} Shift` : "Shift";
  const insertPayload = {
    employee_id,
    title,
    start_time: startIso,
    end_time: endIso,
    status: "pending",
    location: location ?? null,
  } as Record<string, unknown>;

  const { data: inserted, error: insErr } = await supabase
    .from("schedules")
    .insert(insertPayload)
    .select()
    .single();

  if (insErr) return bad(`Failed to create shift: ${insErr.message}`, 500);

  const g = await callGemini(
    `You are a rota assistant. Summarize this newly published single shift as JSON: {title, date, start_time, end_time, location}. Title: ${title}, Date: ${date}, Start: ${start_time}, End: ${end_time}, Location: ${location ?? "N/A"}`
  );

  return json({ success: true, action: "publish", schedule: inserted, ai: g });
}

async function handleConflictCheck(body: any) {
  const { employee_id, start_time, end_time, location } = body || {};
  if (!start_time || !end_time) return bad("start_time and end_time are required");

  const { data: others, error } = await supabase
    .from("schedules")
    .select("id, employee_id, title, start_time, end_time, status, location")
    .or(`status.eq.confirmed,status.eq.pending,status.eq.employee_accepted`);
  if (error) return bad(`Failed to load schedules: ${error.message}`, 500);

  const conflicts = (others || []).filter((s) => {
    if (!overlaps(start_time, end_time, s.start_time, s.end_time)) return false;
    if (employee_id && s.employee_id === employee_id) return true;
    if (location && s.location && s.location === location) return true;
    return false;
  });

  const g = await callGemini(
    `Create a compact JSON report for shift conflict detection. Input: start=${start_time}, end=${end_time}, location=${location ?? "N/A"}, conflicts=${JSON.stringify(
      conflicts,
    )}. Output JSON keys: {has_conflicts:boolean, reasons:string[], conflicts:any[]}`
  );

  return json({ success: true, action: "conflict-check", conflicts, ai: g });
}

async function handleSwap(body: any) {
  const { employee_id_a, shift_id_a, employee_id_b, shift_id_b, commit } = body || {};
  if (!employee_id_a || !shift_id_a || !employee_id_b || !shift_id_b) {
    return bad("employee_id_a, shift_id_a, employee_id_b, shift_id_b are required");
  }

  const { data: shiftA, error: errA } = await supabase
    .from("schedules")
    .select("id, employee_id, start_time, end_time, location, title, status")
    .eq("id", shift_id_a)
    .single();
  if (errA) return bad(`Shift A not found: ${errA.message}`, 404);

  const { data: shiftB, error: errB } = await supabase
    .from("schedules")
    .select("id, employee_id, start_time, end_time, location, title, status")
    .eq("id", shift_id_b)
    .single();
  if (errB) return bad(`Shift B not found: ${errB.message}`, 404);

  // Validate both are swappable (no self-conflicts after swap)
  const aToBConflict = overlaps(shiftA.start_time, shiftA.end_time, shiftB.start_time, shiftB.end_time) && employee_id_a === employee_id_b;
  if (aToBConflict) return bad("Employees identical, swap unnecessary or conflicting");

  const payload = {
    swap_ready: true,
    proposal: {
      shift_id_a: shiftA.id,
      give_to_employee_id: employee_id_b,
      shift_id_b: shiftB.id,
      give_to_employee_id_b: employee_id_a,
    },
  };

  const g = await callGemini(
    `Validate and summarize a shift swap as JSON with keys {valid:boolean, reasons:string[]}. ShiftA=${JSON.stringify(
      shiftA
    )}, ShiftB=${JSON.stringify(shiftB)}`
  );

  if (commit) {
    // Perform the swap atomically
    const { error: upErr } = await supabase.rpc("perform_shift_swap", {
      p_shift_id_a: shiftA.id,
      p_employee_id_a: employee_id_a,
      p_shift_id_b: shiftB.id,
      p_employee_id_b: employee_id_b,
    });

    if (upErr) return bad(`Swap failed: ${upErr.message}`, 500);
    return json({ success: true, action: "swap", committed: true, ai: g, details: payload });
  }

  return json({ success: true, action: "swap", committed: false, ai: g, details: payload });
}

async function handleTrack(body: any) {
  const { employee_id, action_type, action_time } = body || {};
  if (!employee_id || !action_type) return bad("employee_id and action_type are required");

  const actTime = action_time ? new Date(action_time) : new Date();
  const dateOnly = actTime.toISOString().slice(0, 10);

  // Ask DB function for rota compliance details (already implemented in project)
  const { data: compData, error: compErr } = await supabase.rpc("validate_rota_compliance", {
    p_employee_id: employee_id,
    p_action_type: action_type,
    p_action_time: actTime.toISOString(),
  });
  if (compErr) console.error("validate_rota_compliance error", compErr);

  // Upsert attendance
  if (action_type === "clock_in") {
    const { data: existing, error: attErr } = await supabase
      .from("attendance")
      .select("id")
      .eq("employee_id", employee_id)
      .eq("date", dateOnly)
      .maybeSingle();
    if (attErr) console.error("attendance select error", attErr);

    if (existing?.id) {
      await supabase
        .from("attendance")
        .update({ check_in: actTime.toISOString(), active_session: true })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("attendance")
        .insert({ employee_id, date: dateOnly, check_in: actTime.toISOString(), active_session: true });
    }
  } else if (action_type === "clock_out") {
    const { data: existing, error: attErr } = await supabase
      .from("attendance")
      .select("id")
      .eq("employee_id", employee_id)
      .eq("date", dateOnly)
      .maybeSingle();
    if (attErr) console.error("attendance select error", attErr);

    if (existing?.id) {
      await supabase
        .from("attendance")
        .update({ check_out: actTime.toISOString(), active_session: false })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("attendance")
        .insert({ employee_id, date: dateOnly, check_out: actTime.toISOString(), active_session: false });
    }
  }

  // Determine flags
  const flags = {
    late_clock_in: false,
    early_leave: false,
    no_show: false,
    overtime: false,
  } as Record<string, boolean>;

  try {
    const row = Array.isArray(compData) ? compData[0] : compData;
    if (row) {
      if (action_type === "clock_in") flags.late_clock_in = row.is_compliant === false && (row.minutes_difference ?? 0) > 0;
      if (action_type === "clock_out") {
        flags.early_leave = row.is_compliant === false && (row.minutes_difference ?? 0) < 0;
        // row.message may include overtime hint; DB triggers will compute overtime_minutes
      }
    }
  } catch (e) {
    console.warn("Compliance parse issue", e);
  }

  const g = await callGemini(
    `Given rota compliance data ${JSON.stringify(compData)}, produce JSON {risk_level:"low|medium|high", notes:string}`
  );

  return json({ success: true, action: "track", flags, compliance: compData, ai: g });
}

async function handleOvertimeLog(body: any) {
  const { employee_id, date, check_out } = body || {};
  if (!employee_id || !date || !check_out) return bad("employee_id, date, check_out are required");

  // Ensure attendance row exists and set check_out; triggers will compute overtime
  const { data: existing, error: attErr } = await supabase
    .from("attendance")
    .select("id")
    .eq("employee_id", employee_id)
    .eq("date", date)
    .maybeSingle();
  if (attErr) console.error("attendance select error", attErr);

  if (existing?.id) {
    await supabase
      .from("attendance")
      .update({ check_out })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("attendance")
      .insert({ employee_id, date, check_out });
  }

  // Fetch back to return overtime minutes
  const { data: att, error: getErr } = await supabase
    .from("attendance")
    .select("id, overtime_minutes, working_minutes, check_in, check_out")
    .eq("employee_id", employee_id)
    .eq("date", date)
    .single();
  if (getErr) return bad(`Failed to read attendance: ${getErr.message}`, 500);

  const g = await callGemini(
    `Summarize overtime result as JSON {overtime:boolean, message:string}. overtime_minutes=${att.overtime_minutes}`
  );

  return json({ success: true, action: "overtime-log", attendance: att, ai: g });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const action = getActionFromUrl(req.url);
  let body: any = {};
  try {
    if (req.method !== "GET") {
      body = await req.json();
    }
  } catch {
    body = {};
  }

  try {
    switch (action || body.action) {
      case "publish":
        return await handlePublish(body);
      case "conflict-check":
        return await handleConflictCheck(body);
      case "swap":
        return await handleSwap(body);
      case "track":
        return await handleTrack(body);
      case "overtime-log":
        return await handleOvertimeLog(body);
      default:
        return json({
          success: true,
          message: "Shifts API ready",
          routes: [
            "/functions/v1/shifts-api/publish",
            "/functions/v1/shifts-api/conflict-check",
            "/functions/v1/shifts-api/swap",
            "/functions/v1/shifts-api/track",
            "/functions/v1/shifts-api/overtime-log",
          ],
        });
    }
  } catch (e) {
    console.error("shifts-api error", e);
    return bad(`Server error: ${e instanceof Error ? e.message : String(e)}`, 500);
  }
});
