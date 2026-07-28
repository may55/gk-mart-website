#!/bin/bash

# Add .js extensions ONLY to relative imports in compiled output for Node.js ESM
find dist -name "*.js" -type f | while read file; do
  # Only modify relative imports (starting with ./ or ../)
  sed -i '' "s/from '\(\.[^']*\)'/from '\1.js'/g" "$file"
  # Remove double .js.js
  sed -i '' "s/\.js\.js'/\.js'/g" "$file"
done

echo "✓ Added .js extensions to local imports in compiled output"
