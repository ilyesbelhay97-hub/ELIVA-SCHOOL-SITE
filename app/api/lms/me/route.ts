import { NextResponse } from "next/server";
import { getLmsContext, roleHome } from "@/lib/lms";

export async function GET() {
  const { role } = await getLmsContext();
  if (!role) return NextResponse.json({ error: "Accès LMS requis." }, { status: 401 });
  return NextResponse.json({ role, redirect: roleHome(role) });
}
