#!/bin/bash
set -e
if [ -z "$1" ]; then echo "Usage: $0 <plugin-name>"; exit 1; fi

NAME=$1
DIR=".sandbox/$NAME"
mkdir -p "$DIR/src"

cat > "$DIR/package.json" << EOF
{ "name": "sandbox-$NAME", "scripts": { "dev": "vite" }, "dependencies": { "react": "18.2.0", "react-dom": "18.2.0" }, "devDependencies": { "vite": "5.0.0", "@vitejs/plugin-react": "4.2.0", "typescript": "5.3.0" } }
EOF

echo "Sandbox created at $DIR"
