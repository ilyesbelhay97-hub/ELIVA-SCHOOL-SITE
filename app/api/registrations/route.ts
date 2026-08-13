import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RegistrationRequest = {
  fullName?: unknown; phone?: unknown; email?: unknown; formation?: unknown; courseName?: unknown; studyMode?: unknown; wilaya?: unknown; message?: unknown; consent?: unknown; sourcePage?: unknown; referrer?: unknown; utmSource?: unknown; utmMedium?: unknown; utmCampaign?: unknown; utmContent?: unknown; utmTerm?: unknown;
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const optionalText = (value: unknown) => { const result = text(value); return result || null; };

export async function POST(request: Request) {
  let body: RegistrationRequest;
  try { body = await request.json() as RegistrationRequest; } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const fullName = text(body.fullName); const phone = text(body.phone).replace(/[\s().-]/g, ""); const email = text(body.email); const wilaya = text(body.wilaya); const courseName = text(body.courseName); const studyMode = body.studyMode === "En ligne" ? "online" : body.studyMode === "Présentiel" ? "presentiel" : "";
  if (fullName.length < 2 || fullName.length > 120) return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  if (!/^(?:\+213|0)(?:5|6|7)\d{8}$/.test(phone)) return NextResponse.json({ error: "Invalid Algerian phone number." }, { status: 400 });
  if (email && (email.length > 160 || !/^\S+@\S+\.\S+$/.test(email))) return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  if (wilaya.length < 2 || wilaya.length > 80 || !courseName || courseName.length > 200 || !studyMode || body.consent !== true) return NextResponse.json({ error: "Missing or invalid required fields." }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from("registrations").insert({ full_name: fullName, phone: text(body.phone), email: email || null, wilaya, course_name_snapshot: courseName, study_mode: studyMode, message: optionalText(body.message), consent: true, source_page: optionalText(body.sourcePage), referrer: optionalText(body.referrer), utm_source: optionalText(body.utmSource), utm_medium: optionalText(body.utmMedium), utm_campaign: optionalText(body.utmCampaign), utm_content: optionalText(body.utmContent), utm_term: optionalText(body.utmTerm), status: "new" });
  if (error) return NextResponse.json({ error: "Unable to save registration." }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
