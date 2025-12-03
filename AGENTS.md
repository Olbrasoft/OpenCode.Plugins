# 🔌 OpenCode Plugins - Development Guidelines

## 🚨 CRITICAL RULE: NO CONSOLE OUTPUT

**NEVER use `console.*` in plugins - it breaks TUI!**

❌ Forbidden:
- `console.log()`, `console.error()`, `console.warn()`, `console.info()`, `console.debug()`
- Any stdout/stderr output

✅ Correct - log to file:
```typescript
import { appendFileSync, mkdirSync, existsSync } from "fs";

const LOG_DIR = "/tmp/opencode-plugin-logs";
const LOG_FILE = `${LOG_DIR}/plugin-name.log`;

if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

function log(message: string): void {
  const timestamp = new Date().toISOString();
  appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}
```

📁 Log directory: `/tmp/opencode-plugin-logs/`

---

## 📦 Project Structure

```
OpenCode.Plugins/
├── src/
│   └── plugin-name/
│       ├── index.ts      # Main entry point
│       ├── types.ts      # Type definitions
│       └── *.ts          # Other modules
├── dist/                 # Compiled output
├── scripts/
│   └── deploy.sh         # Deployment script
├── package.json
├── tsconfig.json
└── AGENTS.md
```

---

## 🛠️ Development Workflow

1. **Create plugin in `src/plugin-name/`**
2. **Build:** `npm run build`
3. **Deploy:** `npm run deploy` (copies to `~/.config/opencode/plugin/`)
4. **Test:** Restart OpenCode and test plugin functionality

---

## 🔧 Plugin Requirements

- TypeScript with strict mode
- ES2022 target
- ESM modules
- File-based logging only
- No external runtime dependencies (use Node.js built-ins)

---

## 🚀 Deployment

Compiled plugins are deployed to:
```
~/.config/opencode/plugin/plugin-name.js
```

The deploy script handles copying compiled `.js` files from `dist/` to the OpenCode plugin directory.
