#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <plugin-name>"
    echo "Example: $0 tldraw-canvas"
    exit 1
fi

NAME=$1
DIR=".workspaces/$NAME"

if [ -d "$DIR" ]; then
    echo "Error: Workspace $DIR already exists"
    exit 1
fi

echo "Creating workspace: $NAME"

# Copy template
cp -r .workspaces/.template "$DIR"

# Replace placeholders
sed -i "s/{{NAME}}/$NAME/g" "$DIR/package.json"

# Update manifest
cat > "$DIR/manifest.json" << EOF
{
  "name": "$NAME",
  "version": "0.0.1",
  "displayName": "$NAME",
  "description": "Plugin for ZeroClaw OS Dashboard",
  "icon": "🔮",
  "entry": "./src/App.tsx",
  "enabled": true,
  "permissions": ["websocket"]
}
EOF

echo "Workspace created at: $DIR"
echo "Next steps:"
echo "  1. cd $DIR && npm install"
echo "  2. npm run dev  # Start development server"
echo "  3. Build and copy to web-ui/src/plugins/ when ready"
