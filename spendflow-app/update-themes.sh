#!/bin/bash

# Script to update all hardcoded theme colors to use CSS variables

echo "🔄 Starting theme color migration..."

# Find all TSX files with hardcoded colors
files=$(find src -name "*.tsx" -type f | xargs grep -l "bg-slate-900\|border-slate-700\|text-slate-100\|bg-slate-800" | head -20)

for file in $files; do
  echo "📝 Updating $file"

  # Update card backgrounds
  sed -i '' 's/bg-slate-900\/50/border-none/g' "$file"
  sed -i '' 's/border border-slate-800//g' "$file"
  sed -i '' 's/text-slate-100/text-[var(--color-text-primary)]/g' "$file"
  sed -i '' 's/text-slate-400/text-[var(--color-text-tertiary)]/g' "$file"

  echo "✅ Updated $file"
done

echo "🎉 Theme migration complete!"
