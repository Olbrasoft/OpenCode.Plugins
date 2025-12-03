/**
 * GitHub Sub-Issues Plugin for OpenCode
 * 
 * Synchronizes OpenCode TODO items with GitHub sub-issues.
 * 
 * Features:
 * - Auto-detects repository from current git project
 * - Closes GitHub issues when TODOs are marked as completed
 * - Creates GitHub sub-issues when TODOs are added (if parent issue is set)
 * 
 * CRITICAL: No console.* output - uses file-based logging only!
 */

import { log, logError } from "./logger.js";
import { detectRepository } from "./repo-detector.js";
import { closeIssue, createIssue, getIssueNodeId, addSubIssue } from "./github-api.js";
import type { TodoItem, PluginState, RepoInfo } from "./types.js";

// Plugin state
const state: PluginState = {
  parentIssue: null,
  parentIssueNodeId: null,
  repoInfo: null,
  todoToIssueMap: new Map()
};

// Track previous TODO states to detect changes
const previousStates = new Map<string, string>();

/**
 * Check if string is a numeric GitHub issue number
 */
function isNumericIssueId(id: string): boolean {
  return /^\d+$/.test(id);
}

/**
 * Ensure repository info is available
 */
function ensureRepoInfo(): RepoInfo | null {
  if (!state.repoInfo) {
    state.repoInfo = detectRepository();
    if (state.repoInfo) {
      log(`Using repository: ${state.repoInfo.owner}/${state.repoInfo.repo}`);
    }
  }
  return state.repoInfo;
}

/**
 * Handle TODO item state change
 */
function handleTodoChange(todo: TodoItem): void {
  const prev = previousStates.get(todo.id);
  const curr = todo.status;
  
  // No change
  if (prev === curr) return;
  
  // Update tracked state
  previousStates.set(todo.id, curr);
  
  // Only handle numeric IDs (GitHub issue numbers)
  if (!isNumericIssueId(todo.id)) {
    log(`Skipping non-numeric TODO id: ${todo.id}`);
    return;
  }
  
  const repoInfo = ensureRepoInfo();
  if (!repoInfo) {
    logError("No repository detected - cannot sync with GitHub");
    return;
  }
  
  // Handle completion -> close issue
  if (curr === "completed" && prev !== "completed") {
    log(`TODO #${todo.id} completed - closing GitHub issue`);
    closeIssue(repoInfo, parseInt(todo.id, 10));
  }
}

/**
 * Main plugin export
 */
export const GitHubSubIssues = async (_ctx: unknown) => {
  log("Plugin initialized");
  
  return {
    event: async ({ event }: { event: { type: string; properties?: { todos?: TodoItem[] } } }) => {
      if (event.type !== "todo.updated") return;
      
      try {
        const todos = event.properties?.todos || [];
        for (const todo of todos) {
          handleTodoChange(todo);
        }
      } catch (error) {
        logError("Error processing todo event", error);
      }
    },
  };
};

export default GitHubSubIssues;
