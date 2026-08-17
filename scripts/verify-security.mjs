import process from "node:process";
import fs from "node:fs";

for (const line of fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8").split(/\r?\n/) : []) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };
const checks = [];

async function rest(path, options = {}) {
  return fetch(`${url}${path}`, { ...options, headers: { ...headers, ...(options.headers ?? {}) } });
}

async function expectDenied(label, response, allowMissing = true) {
  // Supabase Storage may answer a denied object-list request with 400 instead
  // of 401/403 when the private bucket policy rejects the listing payload.
  const ok = [400, 401, 403, ...(allowMissing ? [404] : [])].includes(response.status);
  checks.push([label, ok]);
  console.log(`${label}: ${ok ? "DENIED" : `UNEXPECTED HTTP ${response.status}`}`);
}

async function expectPublic(label, response) {
  const ok = response.ok;
  checks.push([label, ok]);
  console.log(`${label}: ${ok ? "OK" : `HTTP ${response.status}`}`);
}

for (const table of ["registrations", "admission_attempts", "admission_events", "admission_documents", "admission_payments", "trainers_crm", "centers", "center_interactions", "trainer_interactions"]) {
  await expectDenied(`anonymous read ${table}`, await rest(`/rest/v1/${table}?select=*&limit=1`));
}
for (const table of ["finance_collection_points", "finance_payments", "finance_cash_sessions", "finance_partner_settlements", "finance_events"]) {
  await expectDenied(`anonymous read ${table}`, await rest(`/rest/v1/${table}?select=*&limit=1`), false);
}
await expectPublic("anonymous read published courses", await rest("/rest/v1/courses?select=id&publish_status=eq.published&limit=1"));
await expectPublic("anonymous read approved public trainers", await rest("/rest/v1/public_trainers_cms?select=id,full_name,public_slug&limit=1"));
await expectDenied("anonymous list private trainer CV bucket", await rest("/storage/v1/object/list/trainer-cv", { method: "POST", body: JSON.stringify({ prefix: "", limit: 1 }) }));
await expectDenied("anonymous list private payment receipt bucket", await rest("/storage/v1/object/list/payment-receipts", { method: "POST", body: JSON.stringify({ prefix: "", limit: 1 }) }));

console.log("No rows or files were created by this diagnostic.");
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
