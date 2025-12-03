import * as esbuild from "esbuild";
import { readdirSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "..", "src");
const distDir = join(__dirname, "..", "dist");
const bundleDir = join(__dirname, "..", "bundle");

// Ensure bundle directory exists
if (!existsSync(bundleDir)) {
  mkdirSync(bundleDir, { recursive: true });
}

// Get all plugin directories
const plugins = readdirSync(srcDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

// Bundle each plugin
for (const plugin of plugins) {
  const entryPoint = join(distDir, plugin, "index.js");
  const outFile = join(bundleDir, `${plugin}.js`);
  
  if (!existsSync(entryPoint)) {
    process.stderr.write(`Warning: No entry point for ${plugin}\n`);
    continue;
  }
  
  await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: outFile,
    external: ["child_process", "fs", "path"],
  });
  
  process.stderr.write(`Bundled: ${plugin}.js\n`);
}

process.stderr.write("Bundle complete!\n");
