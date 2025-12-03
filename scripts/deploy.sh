#!/bin/bash
# Deploy compiled plugins to OpenCode plugin directory

PLUGIN_DIR="$HOME/.config/opencode/plugin"
DIST_DIR="$(dirname "$0")/../dist"

# Ensure plugin directory exists
mkdir -p "$PLUGIN_DIR"

# Copy all compiled JS files
for plugin_dir in "$DIST_DIR"/*/; do
    if [ -d "$plugin_dir" ]; then
        plugin_name=$(basename "$plugin_dir")
        if [ -f "$plugin_dir/index.js" ]; then
            cp "$plugin_dir/index.js" "$PLUGIN_DIR/${plugin_name}.js"
            echo "✅ Deployed: ${plugin_name}.js"
        fi
    fi
done

echo "🚀 Deployment complete!"
