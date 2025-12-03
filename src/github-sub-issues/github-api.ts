/**
 * GitHub API interactions using gh CLI
 */

import { execSync } from "child_process";
import { log, logError } from "./logger.js";
import type { RepoInfo, GitHubIssue } from "./types.js";

/**
 * Get issue node ID (required for GraphQL mutations)
 */
export function getIssueNodeId(repoInfo: RepoInfo, issueNumber: number): string | null {
  try {
    const query = `query { repository(owner: "${repoInfo.owner}", name: "${repoInfo.repo}") { issue(number: ${issueNumber}) { id } } }`;
    const result = execSync(`gh api graphql -f query='${query}'`, { encoding: "utf-8" });
    const data = JSON.parse(result);
    return data.data.repository.issue.id;
  } catch (error) {
    logError(`Failed to get node ID for issue #${issueNumber}`, error);
    return null;
  }
}

/**
 * Create a new GitHub issue
 */
export function createIssue(repoInfo: RepoInfo, title: string, body: string): GitHubIssue | null {
  try {
    const cmd = `gh issue create --repo ${repoInfo.owner}/${repoInfo.repo} --title "${escapeShell(title)}" --body "${escapeShell(body)}" --json number,title,state,id`;
    log(`Creating issue: ${title}`);
    const result = execSync(cmd, { encoding: "utf-8" });
    const data = JSON.parse(result);
    log(`Created issue #${data.number}`);
    return {
      number: data.number,
      nodeId: data.id,
      title: data.title,
      state: data.state === "OPEN" ? "OPEN" : "CLOSED"
    };
  } catch (error) {
    logError("Failed to create issue", error);
    return null;
  }
}

/**
 * Close a GitHub issue
 */
export function closeIssue(repoInfo: RepoInfo, issueNumber: number): boolean {
  try {
    execSync(`gh issue close ${issueNumber} --repo ${repoInfo.owner}/${repoInfo.repo}`, { encoding: "utf-8" });
    log(`Closed issue #${issueNumber}`);
    return true;
  } catch (error) {
    logError(`Failed to close issue #${issueNumber}`, error);
    return false;
  }
}

/**
 * Add sub-issue to parent issue using GitHub GraphQL API
 */
export function addSubIssue(parentNodeId: string, childNodeId: string): boolean {
  try {
    const mutation = `mutation { addSubIssue(input: { issueId: "${parentNodeId}", subIssueId: "${childNodeId}" }) { issue { id } } }`;
    execSync(`gh api graphql -f query='${mutation}'`, { encoding: "utf-8" });
    log(`Linked sub-issue to parent`);
    return true;
  } catch (error) {
    logError("Failed to add sub-issue", error);
    return false;
  }
}

/**
 * Escape shell special characters
 */
function escapeShell(str: string): string {
  return str.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}
