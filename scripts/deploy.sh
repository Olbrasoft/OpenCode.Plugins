#!/bin/bash
# Deploy bundled plugins to OpenCode plugin directory

PLUGIN_DIR="$HOME/.config/opencode/plugin"
BUNDLE_DIR="$(dirname "$0")/../bundle"

# Ensure plugin directory exists
mkdir -p "$PLUGIN_DIR"

# Copy all bundled JS files
for bundle_file in "$BUNDLE_DIR"/*.js; do
    if [ -f "$bundle_file" ]; then
        plugin_name=$(basename "$bundle_file")
        cp "$bundle_file" "$PLUGIN_DIR/$plugin_name"
        echo "✅ Deployed: $plugin_name"
    fi
done

echo "🚀 Deployment complete!"
