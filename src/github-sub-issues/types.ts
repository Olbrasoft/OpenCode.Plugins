/**
 * Types for github-sub-issues plugin
 */

export interface TodoItem {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "high" | "medium" | "low";
}

export interface RepoInfo {
  owner: string;
  repo: string;
}

export interface GitHubIssue {
  number: number;
  nodeId: string;
  title: string;
  state: "OPEN" | "CLOSED";
}

export interface PluginState {
  parentIssue: number | null;
  parentIssueNodeId: string | null;
  repoInfo: RepoInfo | null;
  todoToIssueMap: Map<string, number>;
}
