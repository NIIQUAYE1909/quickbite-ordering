#!/bin/bash
# =============================================
# QuickBite - Build Script for Render
# =============================================
# This script compiles the Java backend for deployment
# Run this before deploying to Render
# =============================================

echo "=========================================="
echo "  🍽️ QuickBite - Building for Production"
echo "=========================================="

# Change to the backend directory
cd "$(dirname "$0")"

echo ""
echo "📦 Compiling Java source files..."

# Compile all Java files in src/ directory
# The MySQL connector is only required when running the server.
javac -cp "src" -d out src/*.java

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
    echo ""
    echo "📁 Output directory: out/"
    echo "🚀 Ready for deployment to Render!"
else
    echo "❌ Compilation failed!"
    exit 1
fi
