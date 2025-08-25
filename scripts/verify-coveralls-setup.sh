#!/bin/bash

# Coveralls Setup Verification Script
# This script verifies that all Coveralls configuration is correct

echo "🔍 Verifying Coveralls Setup..."

# Check if required files exist
echo "📁 Checking configuration files..."

if [ -f ".coveralls.yml" ]; then
    echo "⚠️  .coveralls.yml exists (not needed for public repos)"
else
    echo "✅ .coveralls.yml not needed for public repos"
fi

if [ -f ".github/workflows/test-coverage.yml" ]; then
    echo "✅ GitHub Actions workflow exists"
else
    echo "❌ GitHub Actions workflow missing"
    exit 1
fi

if [ -f "karma.conf.js" ]; then
    echo "✅ Karma configuration exists"
else
    echo "❌ Karma configuration missing"
    exit 1
fi

# Check if token is configured
echo "🔑 Checking Coveralls token..."

if [ -f ".coveralls.yml" ] && grep -q "repo_token:" .coveralls.yml && ! grep -q "# repo_token:" .coveralls.yml; then
    echo "⚠️  Coveralls token found in .coveralls.yml (should use environment variable instead)"
else
    echo "✅ Coveralls token properly configured (using environment variable or public repo)"
fi

# Check if karma-coverage is installed
echo "📦 Checking dependencies..."

if npm list karma-coverage > /dev/null 2>&1; then
    echo "✅ karma-coverage is installed"
else
    echo "❌ karma-coverage not installed"
    echo "Run: npm install karma-coverage --save-dev"
    exit 1
fi

# Check if test script exists
echo "🧪 Checking test scripts..."

if grep -q "test:coverage" package.json; then
    echo "✅ test:coverage script exists"
else
    echo "❌ test:coverage script missing"
    exit 1
fi

echo ""
echo "🎉 All Coveralls configuration checks passed!"
echo ""
echo "📋 Next steps:"
echo "1. Activate repo at https://coveralls.io"
echo "2. Push your changes to trigger the first coverage run"
echo "3. Check Coveralls dashboard for results"
echo ""
echo "🔗 Coveralls Dashboard: https://coveralls.io/github/ArnauM13/pelu-app?branch=master"
