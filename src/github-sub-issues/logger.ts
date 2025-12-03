/**
 * File-based logging utility
 * CRITICAL: Never use console.* - it breaks TUI!
 */

import { appendFileSync, mkdirSync, existsSync } from "fs";

const LOG_DIR = "/tmp/opencode-plugin-logs";
const LOG_FILE = `${LOG_DIR}/github-sub-issues.log`;

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

export function log(message: string): void {
  const timestamp = new Date().toISOString();
  appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

export function logError(message: string, error?: unknown): void {
  const timestamp = new Date().toISOString();
  const errorStr = error instanceof Error ? error.message : String(error);
  appendFileSync(LOG_FILE, `[${timestamp}] ERROR: ${message} - ${errorStr}\n`);
}
