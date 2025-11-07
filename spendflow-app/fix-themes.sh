#!/bin/bash

echo "🎨 Starting comprehensive theme color update..."

# Find all TSX files
files=$(find src -name "*.tsx" -type f)

total_files=$(echo "$files" | wc -l)
echo "📝 Found $total_files files to update"

count=0
for file in $files; do
  count=$((count + 1))
  echo "[$count/$total_files] Updating $file"

  # Create backup
  cp "$file" "${file}.backup"

  # Update card backgrounds and borders
  sed -i '' 's/bg-slate-900\/50/style={{ backgroundColor: '\''var(--color-card-bg)'\'', borderColor: '\''var(--color-card-border)'\'' }}/g' "$file"
  sed -i '' 's/border border-slate-800/border/g' "$file"

  # Update text colors
  sed -i '' 's/text-slate-100/style={{ color: '\''var(--color-text-primary)'\'' }}/g' "$file"
  sed -i '' 's/text-slate-400/style={{ color: '\''var(--color-text-tertiary)'\'' }}/g' "$file"
  sed -i '' 's/text-slate-300/style={{ color: '\''var(--color-text-secondary)'\'' }}/g' "$file"

  # Update accent colors
  sed -i '' 's/text-amber-400/style={{ color: '\''var(--color-accent)'\'' }}/g' "$file"
  sed -i '' 's/bg-amber-900\/30/style={{ backgroundColor: '\''var(--color-accent)'\'' }}/g' "$file"

  # Update status colors
  sed -i '' 's/text-green-400/style={{ color: '\''var(--color-success)'\'' }}/g' "$file"
  sed -i '' 's/text-red-400/style={{ color: '\''var(--color-error)'\'' }}/g' "$file"
  sed -i '' 's/text-blue-400/style={{ color: '\''var(--color-info)'\'' }}/g' "$file"
  sed -i '' 's/text-purple-400/style={{ color: '\''var(--color-warning)'\'' }}/g' "$file"

done

echo "🎉 Theme update complete! $count files processed."
echo "⚠️  Backups created with .backup extension"
echo "🔍 Check for any syntax errors and test the app"
