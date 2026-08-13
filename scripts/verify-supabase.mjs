import process from "node:process";
import fs from "node:fs";

for (const line of fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8").split(/\r?\n/) : []) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
}

const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exitCode = 1;
  process.exit();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkTable(name, key, label) {
  const response = await fetch(`${url}/rest/v1/${name}?select=*&limit=0`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  console.log(`${label}: ${response.ok ? "OK" : `HTTP ${response.status}`}`);
  return response.ok;
}

console.log(`Supabase project: ${new URL(url).hostname}`);
await checkTable("courses", publicKey, "public courses endpoint");
await checkTable("public_trainers_cms", publicKey, "public trainers view");
for (const table of ["registrations", "trainers_crm", "trainer_interactions", "centers", "center_interactions"]) await checkTable(table, serviceKey, `service verification ${table}`);

const buckets = await fetch(`${url}/storage/v1/bucket`, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });
if (buckets.ok) {
  const names = (await buckets.json()).map((bucket) => bucket.id);
  for (const expected of ["trainer-cv", "course-covers", "trainer-public"]) console.log(`bucket ${expected}: ${names.includes(expected) ? "OK" : "MISSING"}`);
} else console.log(`storage buckets: HTTP ${buckets.status}`);

console.log("Diagnostic only: no rows, files, policies, or settings were modified.");
