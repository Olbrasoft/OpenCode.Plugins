# OpenCode.Plugins

TypeScript plugins collection for [OpenCode](https://opencode.ai) AI assistant.

## Plugins

### github-sub-issues

Synchronizes OpenCode TODO items with GitHub sub-issues.

**Features:**
- Auto-detects repository from current git project
- Creates GitHub sub-issues when TODOs are added
- Closes sub-issues when TODOs are marked as completed
- Links sub-issues to parent issue using GitHub's native sub-issues API

## Installation

```bash
npm install
npm run build
npm run deploy
```

## Development

See [AGENTS.md](./AGENTS.md) for development guidelines.

**⚠️ Critical:** Never use `console.*` in plugins - use file-based logging instead.

## License

MIT
