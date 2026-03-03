#!/bin/bash
cd workspace/web-ui
npx tsx src/server/telemetry.ts &
sleep 2
npm run dev &
sleep 5
node take_screenshots.js