// dist/github-sub-issues/logger.js
import { appendFileSync, mkdirSync, existsSync } from "fs";
var LOG_DIR = "/tmp/opencode-plugin-logs";
var LOG_FILE = `${LOG_DIR}/github-sub-issues.log`;
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}
function log(message) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  appendFileSync(LOG_FILE, `[${timestamp}] ${message}
`);
}
function logError(message, error) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const errorStr = error instanceof Error ? error.message : String(error);
  appendFileSync(LOG_FILE, `[${timestamp}] ERROR: ${message} - ${errorStr}
`);
}

// dist/github-sub-issues/repo-detector.js
import { execSync } from "child_process";
function detectRepository(cwd) {
  try {
    const options = cwd ? { cwd, encoding: "utf-8" } : { encoding: "utf-8" };
    const remoteUrl = execSync("git remote get-url origin", options).trim();
    log(`Detected git remote: ${remoteUrl}`);
    const httpsMatch = remoteUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (httpsMatch) {
      return { owner: httpsMatch[1], repo: httpsMatch[2] };
    }
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

// dist/github-sub-issues/github-api.js
import { execSync as execSync2 } from "child_process";
function closeIssue(repoInfo, issueNumber) {
  try {
    execSync2(`gh issue close ${issueNumber} --repo ${repoInfo.owner}/${repoInfo.repo}`, { encoding: "utf-8" });
    log(`Closed issue #${issueNumber}`);
    return true;
  } catch (error) {
    logError(`Failed to close issue #${issueNumber}`, error);
    return false;
  }
}

// dist/github-sub-issues/index.js
var state = {
  parentIssue: null,
  parentIssueNodeId: null,
  repoInfo: null,
  todoToIssueMap: /* @__PURE__ */ new Map()
};
var previousStates = /* @__PURE__ */ new Map();
function isNumericIssueId(id) {
  return /^\d+$/.test(id);
}
function ensureRepoInfo() {
  if (!state.repoInfo) {
    state.repoInfo = detectRepository();
    if (state.repoInfo) {
      log(`Using repository: ${state.repoInfo.owner}/${state.repoInfo.repo}`);
    }
  }
  return state.repoInfo;
}
function handleTodoChange(todo) {
  const prev = previousStates.get(todo.id);
  const curr = todo.status;
  if (prev === curr)
    return;
  previousStates.set(todo.id, curr);
  if (!isNumericIssueId(todo.id)) {
    log(`Skipping non-numeric TODO id: ${todo.id}`);
    return;
  }
  const repoInfo = ensureRepoInfo();
  if (!repoInfo) {
    logError("No repository detected - cannot sync with GitHub");
    return;
  }
  if (curr === "completed" && prev !== "completed") {
    log(`TODO #${todo.id} completed - closing GitHub issue`);
    closeIssue(repoInfo, parseInt(todo.id, 10));
  }
}
var GitHubSubIssues = async (_ctx) => {
  log("Plugin initialized");
  return {
    event: async ({ event }) => {
      if (event.type !== "todo.updated")
        return;
      try {
        const todos = event.properties?.todos || [];
        for (const todo of todos) {
          handleTodoChange(todo);
        }
      } catch (error) {
        logError("Error processing todo event", error);
      }
    }
  };
};
var index_default = GitHubSubIssues;
export {
  GitHubSubIssues,
  index_default as default
};
