#!/bin/bash
# Save current directory
CURRENT_DIR="$(pwd)"
# Change to the parent directory of this script
cd "$(dirname "$0")/.."
# Run the npm command
npm run start
# Return to original directory
cd "$CURRENT_DIR" 