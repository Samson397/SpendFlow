#!/bin/bash

# Script to create favicon and logo variants from image.png
# Run this in the /public directory

echo "Creating favicon and logo variants..."

# Create favicon sizes
convert image.png -resize 16x16 favicon-16x16.png
convert image.png -resize 32x32 favicon-32x32.png
convert image.png -resize 96x96 icon-96.png
convert image.png -resize 128x128 icon-128.png
convert image.png -resize 192x192 icon-192.png
convert image.png -resize 256x256 icon-256.png
convert image.png -resize 512x512 icon-512.png

# Create touch icon
convert image.png -resize 180x180 apple-touch-icon.png

# Create favicon.ico
convert image.png -resize 32x32 favicon.ico

# Create logo variants
convert image.png -resize 64x64 logo-64.png
convert image.png -resize 128x128 logo-128.png
convert image.png -resize 256x256 logo-256.png

echo "Done! Created all favicon and logo variants."
echo ""
echo "Files created:"
echo "- favicon-16x16.png (16x16)"
echo "- favicon-32x32.png (32x32)"
echo "- favicon.ico (32x32)"
echo "- icon-96.png (96x96)"
echo "- icon-128.png (128x128)"
echo "- icon-192.png (192x192)"
echo "- icon-256.png (256x256)"
echo "- icon-512.png (512x512)"
echo "- apple-touch-icon.png (180x180)"
echo "- logo-64.png (64x64)"
echo "- logo-128.png (128x128)"
echo "- logo-256.png (256x256)"
echo ""
echo "Now update your Next.js metadata to use these new files."
