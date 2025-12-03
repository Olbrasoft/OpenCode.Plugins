/**
 * Repository detection from git remote
 */

import { execSync } from "child_process";
import { log, logError } from "./logger.js";
import type { RepoInfo } from "./types.js";

/**
 * Detects repository info from git remote URL
 * Supports: https://github.com/owner/repo.git and git@github.com:owner/repo.git
 */
export function detectRepository(cwd?: string): RepoInfo | null {
  try {
    const options = cwd ? { cwd, encoding: "utf-8" as const } : { encoding: "utf-8" as const };
    const remoteUrl = execSync("git remote get-url origin", options).trim();
    
    log(`Detected git remote: ${remoteUrl}`);
    
    // Parse HTTPS URL: https://github.com/owner/repo.git
    const httpsMatch = remoteUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (httpsMatch) {
      return { owner: httpsMatch[1], repo: httpsMatch[2] };
    }
    
    // Parse SSH URL: git@github.com:owner/repo.git
    const sshMatch = remoteUrl.match(/github\.com:([^/]+)\/([^/.]+)/);
    if (sshMatch) {
      return { owner: sshMatch[1], repo: sshMatch[2] };
    }
    
    logError("Could not parse GitHub URL from remote", remoteUrl);
    return null;
  } catch (error) {
    logError("Failed to detect repository", error);
    return null;
  }
}
