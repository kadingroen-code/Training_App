#!/bin/bash

# Diagnostic script for PostgreSQL installation issues
# This will help identify why brew install postgresql@15 is failing

echo "=========================================="
echo "PostgreSQL Installation Diagnostic"
echo "=========================================="
echo ""

# Hypothesis A: Homebrew not properly installed
echo "=== Hypothesis A: Homebrew Installation ==="
if command -v brew &> /dev/null; then
    echo "✅ Homebrew is installed"
    brew --version
else
    echo "❌ Homebrew not found in PATH"
    echo "   This could cause installation failures"
fi
echo ""

# Hypothesis B: Homebrew permissions issues
echo "=== Hypothesis B: Homebrew Permissions ==="
BREW_PREFIX=$(brew --prefix 2>/dev/null || echo "NOT_FOUND")
if [ "$BREW_PREFIX" != "NOT_FOUND" ]; then
    echo "✅ Homebrew prefix: $BREW_PREFIX"
    if [ -w "$BREW_PREFIX" ]; then
        echo "✅ Homebrew directory is writable"
    else
        echo "❌ Homebrew directory is NOT writable"
        echo "   This could cause installation failures"
    fi
else
    echo "❌ Could not determine Homebrew prefix"
fi
echo ""

# Hypothesis C: Network/API connectivity
echo "=== Hypothesis C: Network Connectivity ==="
if curl -s --max-time 5 https://api.github.com > /dev/null 2>&1; then
    echo "✅ Can reach GitHub API (needed for Homebrew)"
else
    echo "❌ Cannot reach GitHub API"
    echo "   This could cause installation failures"
fi
echo ""

# Hypothesis D: Disk space
echo "=== Hypothesis D: Disk Space ==="
df -h / | tail -1 | awk '{print "Available space: " $4 " out of " $2}'
DISK_AVAIL=$(df -h / | tail -1 | awk '{print $4}' | sed 's/[^0-9]//g')
if [ "$DISK_AVAIL" -gt 5 ]; then
    echo "✅ Sufficient disk space (>5GB)"
else
    echo "⚠️  Low disk space (<5GB available)"
    echo "   PostgreSQL installation requires ~200MB"
fi
echo ""

# Hypothesis E: Homebrew cache corruption
echo "=== Hypothesis E: Homebrew Cache ==="
CACHE_DIR="$HOME/Library/Caches/Homebrew"
if [ -d "$CACHE_DIR" ]; then
    CACHE_SIZE=$(du -sh "$CACHE_DIR" 2>/dev/null | awk '{print $1}')
    echo "Cache directory exists: $CACHE_DIR"
    echo "Cache size: $CACHE_SIZE"
    if [ -w "$CACHE_DIR" ]; then
        echo "✅ Cache directory is writable"
    else
        echo "❌ Cache directory is NOT writable"
        echo "   This could cause installation failures"
    fi
else
    echo "⚠️  Cache directory not found"
fi
echo ""

# Hypothesis F: Try actual installation with verbose output
echo "=== Hypothesis F: Actual Installation Attempt ==="
echo "Attempting to install postgresql@15 with verbose output..."
echo ""

# Try to install and capture the actual error
if brew install postgresql@15 2>&1 | tee /tmp/postgres_install_output.txt; then
    echo ""
    echo "✅ Installation succeeded!"
else
    INSTALL_EXIT_CODE=$?
    echo ""
    echo "❌ Installation failed with exit code: $INSTALL_EXIT_CODE"
    echo ""
    echo "Last 20 lines of output:"
    tail -20 /tmp/postgres_install_output.txt
    echo ""
    echo "Full output saved to: /tmp/postgres_install_output.txt"
fi
echo ""

# Summary
echo "=========================================="
echo "Diagnostic Summary"
echo "=========================================="
echo ""
echo "Check the output above for any ❌ marks."
echo "Common fixes:"
echo "  1. If permissions issue: sudo chown -R \$(whoami) \$(brew --prefix)"
echo "  2. If cache issue: brew cleanup"
echo "  3. If network issue: check internet connection"
echo "  4. If Homebrew issue: brew doctor"
echo ""
