#!/bin/bash

# Test Coverage Script for PeluApp
# This script runs tests with coverage and displays results

echo "🧪 Running tests with coverage..."

# Run tests with coverage
npm run test:coverage

# Check if coverage report was generated
if [ -f "./coverage/lcov.info" ]; then
    echo "✅ Coverage report generated successfully!"
    echo "📊 Coverage report location: ./coverage/"
    echo "🌐 Open coverage/index.html to view detailed report"
else
    echo "❌ Coverage report not found!"
    echo "Please check if tests are running correctly"
    exit 1
fi

echo "🎉 Coverage test completed!"
