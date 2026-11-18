/**
 * Central environment validation. Reports variable NAMES only, never values.
 */
export type EnvReport = {
  missing: string[];
  warnings: string[];
};

const GEMINI_KEY_VARS = [
  "GEMINI_API_KEY",
  "GOOGLE_GEMINI_API_KEY",
  "GOOGLE_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
] as const;

function has(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export function validateEnv(): EnvReport {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const name of [
    "DATABASE_URL",
    "DESCOPE_PROJECT_ID",
    "DESCOPE_MANAGEMENT_KEY",
  ]) {
    if (!has(name)) missing.push(name);
  }

  if (!GEMINI_KEY_VARS.some(has) && !has("OPENAI_API_KEY")) {
    missing.push("GEMINI_API_KEY (or OPENAI_API_KEY)");
  }

  if (!has("DESCOPE_CALENDAR_CONNECTION_ID")) {
    warnings.push(
      "DESCOPE_CALENDAR_CONNECTION_ID not set; defaulting to 'google-calendar'. It must equal the Outbound App ID in the Descope Console.",
    );
  }
  if (!has("APP_URL")) {
    warnings.push("APP_URL not set; CORS defaults to http://localhost:3000.");
  }
  if (!has("DESCOPE_MCP_SERVER_WELL_KNOWN_URL")) {
    warnings.push("MCP endpoint disabled (DESCOPE_MCP_SERVER_WELL_KNOWN_URL empty).");
  }

  return { missing, warnings };
}

export function logEnvReport(): void {
  const { missing, warnings } = validateEnv();
  if (missing.length) {
    console.error(`[env] Missing required variables: ${missing.join(", ")}`);
  }
  for (const w of warnings) console.warn(`[env] ${w}`);
}
