import { randomBytes } from "node:crypto";
import { readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Run from the repository root. Never print the credentials this file handles.
const envPath = resolve(".env.local");
let contents = readFileSync(envPath, "utf8");

function valueOf(key) {
  const matches = [...contents.matchAll(new RegExp(`^${key}=(.*)$`, "gm"))];
  if (matches.length !== 1) throw new Error(`Expected exactly one ${key} entry`);
  return matches[0][1];
}

function setValue(key, value) {
  valueOf(key);
  contents = contents.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${value}`);
}

const pooled = new URL(valueOf("NEON_POSTGRES_DATABASE_CONNECTION"));
if (
  !["postgres:", "postgresql:"].includes(pooled.protocol) ||
  !/^[^.]+-pooler\..+\.neon\.tech$/.test(pooled.hostname) ||
  pooled.searchParams.get("sslmode") !== "require"
) {
  throw new Error("Expected a pooled Neon PostgreSQL URL with sslmode=require");
}

const direct = new URL(pooled);
direct.hostname = pooled.hostname.replace(/^([^.]+)-pooler\./, "$1.");

for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED"]) {
  const current = new URL(valueOf(key));
  if (
    !["localhost", "127.0.0.1"].includes(current.hostname) &&
    current.toString() !== (key === "DATABASE_URL" ? pooled : direct).toString()
  ) {
    throw new Error(`${key} already points elsewhere; refusing to replace it`);
  }
}

setValue("DATABASE_URL", pooled.toString());
setValue("DATABASE_URL_UNPOOLED", direct.toString());

for (const key of ["NEON_AUTH_COOKIE_SECRET", "CRON_SECRET"]) {
  if (!valueOf(key)) setValue(key, randomBytes(32).toString("base64url"));
}

const tempPath = `${envPath}.tmp-${randomBytes(8).toString("hex")}`;
try {
  writeFileSync(tempPath, contents, { flag: "wx", mode: 0o600 });
  renameSync(tempPath, envPath);
} catch (error) {
  try { unlinkSync(tempPath); } catch { /* No temporary file to remove. */ }
  throw error;
}

console.log("Configured local Neon database URLs and application secrets; values were not printed.");
