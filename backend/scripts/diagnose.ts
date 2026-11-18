import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

// Prints PASS/FAIL per check. Never prints secret values.
async function main() {
  const { validateEnv } = await import("../src/config/env");
  const { getPool, closePool } = await import("../src/db/pool");
  const { descopeClient, CALENDAR_CONNECTION_ID } = await import("../src/config/descope");

  const env = validateEnv();
  console.log(env.missing.length ? `FAIL env: missing ${env.missing.join(", ")}` : "PASS env: required variables present");
  env.warnings.forEach((w) => console.log(`WARN ${w}`));

  try {
    await getPool().query("SELECT 1");
    const t = await getPool().query("SELECT to_regclass('public.users') AS u, to_regclass('public.connections') AS c");
    console.log(t.rows[0].u && t.rows[0].c ? "PASS db: connected, tables exist" : "FAIL db: connected but run `npm run migrate`");
  } catch (e) {
    console.log(`FAIL db: ${(e as Error).message}`);
  } finally {
    await closePool();
  }

  const apps = await descopeClient.management.outboundApplication.loadAllApplications();
  if (!apps.ok) {
    console.log(`FAIL descope management API: HTTP ${apps.code} ${apps.error?.errorCode ?? ""} (check DESCOPE_PROJECT_ID / DESCOPE_MANAGEMENT_KEY belong to the same project)`);
    return;
  }
  const ids = (apps.data ?? []).map((a) => `${a.id} (${a.name})`);
  console.log(`INFO outbound apps in this Descope project: ${ids.length ? ids.join(", ") : "NONE"}`);
  const match = (apps.data ?? []).some((a) => a.id === CALENDAR_CONNECTION_ID);
  console.log(
    match
      ? `PASS outbound app '${CALENDAR_CONNECTION_ID}' exists`
      : `FAIL outbound app '${CALENDAR_CONNECTION_ID}' NOT found -> this is the "record not found" error. Set DESCOPE_CALENDAR_CONNECTION_ID to one of the IDs above, or create the app in the Console.`,
  );
}

main().catch((e) => {
  console.error("diagnose crashed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
